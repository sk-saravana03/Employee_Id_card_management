import crypto from 'crypto';
import User from '../models/User.model.js';
import Session from '../models/Session.model.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from '../utils/jwt.util.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../services/email.service.js';
import { recordAuditLog } from '../services/audit.service.js';

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user & get tokens
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password, enforceSingleSession = true } = req.body;

    const user = await User.findOne({ email })
      .select('+password +resetPasswordToken')
      .populate('role')
      .populate('branch')
      .populate('department');

    if (!user) {
      await recordAuditLog({
        action: 'LOGIN_FAILED_INVALID_EMAIL',
        module: 'AUTH',
        details: { email },
        req,
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify corporate email and password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await recordAuditLog({
        userId: user._id,
        action: 'LOGIN_FAILED_BAD_PASSWORD',
        module: 'AUTH',
        details: { email },
        req,
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify corporate email and password.',
      });
    }

    if (user.status !== 'ACTIVE') {
      await recordAuditLog({
        userId: user._id,
        action: 'LOGIN_FAILED_ACCOUNT_SUSPENDED',
        module: 'AUTH',
        details: { status: user.status },
        req,
      });
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status.toLowerCase()}. Access denied.`,
      });
    }

    // Single Active Session Enforcement: Invalidate previous active sessions if requested
    if (enforceSingleSession || user.singleSessionOnly) {
      await Session.updateMany(
        { user: user._id, isActive: true },
        { $set: { isActive: false } }
      );
    }

    // Generate JWT Tokens
    const payload = {
      userId: user._id,
      role: user.role?.name || 'Employee',
      email: user.email,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Calculate refresh token hash for DB session indexing
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Browser Client';

    // Create New Active Session Record
    await Session.create({
      user: user._id,
      refreshTokenHash,
      ipAddress,
      userAgent,
      isActive: true,
      expiresAt,
      lastActiveAt: new Date(),
    });

    // Update User Last Login Stats
    user.lastLoginAt = new Date();
    user.lastLoginIp = ipAddress;
    await user.save();

    // Set Refresh Token in HTTP-Only Cookie
    setRefreshTokenCookie(res, refreshToken);

    // Audit Log
    await recordAuditLog({
      userId: user._id,
      action: 'LOGIN_SUCCESS',
      module: 'AUTH',
      details: { role: user.role?.name, ipAddress },
      req,
    });

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: 'Authentication successful. Welcome to Enterprise System.',
      data: {
        user: userObj,
        accessToken,
      },
    });
  } catch (error) {
    console.error('[Login Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'An internal error occurred during authentication.',
    });
  }
};

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Invalidate current session & clear refresh cookie
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await Session.updateOne({ refreshTokenHash }, { $set: { isActive: false } });
    }

    if (req.user) {
      await Session.updateMany({ user: req.user._id, isActive: true }, { $set: { isActive: false } });
      await recordAuditLog({
        userId: req.user._id,
        action: 'LOGOUT_SUCCESS',
        module: 'AUTH',
        req,
      });
    }

    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('[Logout Error]:', error);
    clearRefreshTokenCookie(res);
    return res.status(200).json({ success: true, message: 'Logged out.' });
  }
};

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Issue new access token from refresh cookie
 * @access  Public (uses httpOnly cookie)
 */
const refreshToken = async (req, res) => {
  try {
    const tokenFromCookie = req.cookies?.refreshToken;

    if (!tokenFromCookie) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token cookie missing.',
      });
    }

    const decoded = verifyRefreshToken(tokenFromCookie);
    if (!decoded || !decoded.userId) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token. Please re-authenticate.',
      });
    }

    // Verify token exists in active Session database record
    const refreshTokenHash = crypto.createHash('sha256').update(tokenFromCookie).digest('hex');
    const session = await Session.findOne({
      refreshTokenHash,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Session has expired or was revoked. Please log in again.',
      });
    }

    const user = await User.findById(decoded.userId)
      .populate('role')
      .populate('branch')
      .populate('department');

    if (!user || user.status !== 'ACTIVE') {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'User account disabled.',
      });
    }

    // Issue new access token
    const newAccessToken = generateAccessToken({
      userId: user._id,
      role: user.role?.name || 'Employee',
      email: user.email,
    });

    // Update Session Heartbeat
    session.lastActiveAt = new Date();
    await session.save();

    const userObj = user.toObject();

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        user: userObj,
      },
    });
  } catch (error) {
    console.error('[Refresh Token Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Could not refresh session token.',
    });
  }
};

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Return neutral message for security anti-enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account with that corporate email exists, a password reset link has been dispatched.',
      });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send email
    await sendPasswordResetEmail(user.email, resetToken, `${user.firstName} ${user.lastName}`);

    await recordAuditLog({
      userId: user._id,
      action: 'FORGOT_PASSWORD_REQUESTED',
      module: 'AUTH',
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'If an account with that corporate email exists, a password reset link has been dispatched.',
    });
  } catch (error) {
    console.error('[Forgot Password Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing password reset request.',
    });
  }
};

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset security token.',
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Invalidate existing active sessions for security
    await Session.updateMany({ user: user._id }, { $set: { isActive: false } });

    await recordAuditLog({
      userId: user._id,
      action: 'RESET_PASSWORD_SUCCESS',
      module: 'AUTH',
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. Please log in with your new credentials.',
    });
  } catch (error) {
    console.error('[Reset Password Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Error resetting password.',
    });
  }
};

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password for authenticated user
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password provided is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    await recordAuditLog({
      userId: user._id,
      action: 'CHANGE_PASSWORD_SUCCESS',
      module: 'AUTH',
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    console.error('[Change Password Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update password.',
    });
  }
};

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify user email with token
 * @access  Public
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({
      verificationToken: token,
    }).select('+verificationToken');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired email verification token.',
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    await recordAuditLog({
      userId: user._id,
      action: 'EMAIL_VERIFIED_SUCCESS',
      module: 'AUTH',
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Corporate email address successfully verified.',
    });
  } catch (error) {
    console.error('[Verify Email Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify email.',
    });
  }
};

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get currently authenticated user details
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('role')
      .populate('branch')
      .populate('department');

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch current user.',
    });
  }
};

export {
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  getMe,
};
