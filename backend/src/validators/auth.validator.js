import { body } from 'express-validator';

const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Valid enterprise corporate email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const forgotPasswordValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid corporate email address')
    .normalizeEmail(),
];

const resetPasswordValidator = [
  body('token')
    .notEmpty()
    .withMessage('Security reset token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one numeric digit')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter'),
];

const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('New password must contain at least one numeric digit')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter'),
];

const verifyEmailValidator = [
  body('token')
    .notEmpty()
    .withMessage('Email verification token is required'),
];

export {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  verifyEmailValidator,
};
