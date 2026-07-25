import express from 'express';
const router = express.Router();
import {
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  getMe,
  updateProfile,
} from '../controllers/auth.controller.js';
import {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  verifyEmailValidator,
} from '../validators/auth.validator.js';
import validate from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import { verifySession } from '../middleware/session.middleware.js';

// Public Routes
router.post('/login', loginValidator, validate, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);
router.post('/verify-email', verifyEmailValidator, validate, verifyEmail);

// Protected Routes
router.use(protect);
router.use(verifySession);

router.get('/me', getMe);
router.put('/profile', updateProfile);
router.post('/change-password', changePasswordValidator, validate, changePassword);

export default router;
