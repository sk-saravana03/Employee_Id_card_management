import { verifyAccessToken } from '../utils/jwt.util.js';
import User from '../models/User.model.js';
import Session from '../models/Session.model.js';

const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required. Please login to access this resource.',
      });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired access token. Session refresh required.',
      });
    }

    const user = await User.findById(decoded.userId)
      .populate('role')
      .populate('branch')
      .populate('department');

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive or disabled. Contact system administrator.',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Authentication check failed.',
    });
  }
};

export { protect };
