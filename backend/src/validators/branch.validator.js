import { body, param } from 'express-validator';

export const createBranchValidator = [
  body('name')
    .notEmpty()
    .withMessage('Branch name is required')
    .trim(),
  body('code')
    .notEmpty()
    .withMessage('Branch code is required')
    .trim(),
];

export const updateBranchValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid branch ObjectId parameter required'),
];
