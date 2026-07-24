import { body, param, query } from 'express-validator';

export const createEmployeeValidator = [
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .trim(),
  body('firstName')
    .notEmpty()
    .withMessage('First Name is required')
    .trim(),
  body('lastName')
    .notEmpty()
    .withMessage('Last Name is required')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Valid corporate email address is required')
    .normalizeEmail(),
  body('designation')
    .notEmpty()
    .withMessage('Designation is required')
    .trim(),
  body('department')
    .isMongoId()
    .withMessage('Valid department ID reference is required'),
  body('branch')
    .isMongoId()
    .withMessage('Valid branch ID reference is required'),
  body('joiningDate')
    .isISO8601()
    .withMessage('Valid joining date is required'),
];

export const updateEmployeeValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid employee ObjectId parameter required'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid corporate email address is required'),
];
