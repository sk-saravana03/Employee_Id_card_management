import { body, param } from 'express-validator';

export const createUserValidator = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required'),
  body('email')
    .isEmail()
    .withMessage('Valid corporate email is required')
    .normalizeEmail(),
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isMongoId()
    .withMessage('Valid role ID is required'),
];

export const updateUserValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid user ObjectId parameter required'),
];
