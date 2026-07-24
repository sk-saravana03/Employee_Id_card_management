import { body, param } from 'express-validator';

export const createDepartmentValidator = [
  body('name')
    .notEmpty()
    .withMessage('Department name is required')
    .trim(),
  body('code')
    .notEmpty()
    .withMessage('Department code is required')
    .trim(),
  body('branch')
    .isMongoId()
    .withMessage('Valid branch reference ID is required'),
];

export const updateDepartmentValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid department ObjectId parameter required'),
];
