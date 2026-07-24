import jwt from 'jsonwebtoken';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'enterprise_jwt_access_secret_key_32_bytes_min!';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'enterprise_jwt_refresh_secret_key_32_bytes_min!';
const JWT_ACCESS_EXPIRE = process.env.JWT_ACCESS_EXPIRE || '15m';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

/**
 * Generate Access Token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRE });
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRE });
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Send HTTP-Only Cookie with Refresh Token
 */
const setRefreshTokenCookie = (res, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // or 'strict' depending on cross-origin setup
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);
};

/**
 * Clear Refresh Token Cookie
 */
const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};
