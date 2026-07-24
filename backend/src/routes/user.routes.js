import express from 'express';
import {
  getUsers,
  getRoles,
  createUser,
  updateUser,
  resetUserPassword,
} from '../controllers/user.controller.js';
import {
  createUserValidator,
  updateUserValidator,
} from '../validators/user.validator.js';
import validate from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import { verifySession } from '../middleware/session.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(protect);
router.use(verifySession);

router.get('/roles', getRoles);
router.get('/', authorize('Super Admin', 'HR/Admin'), getUsers);

router.post(
  '/',
  authorize('Super Admin', 'HR/Admin'),
  createUserValidator,
  validate,
  createUser
);

router.put(
  '/:id',
  authorize('Super Admin'),
  updateUserValidator,
  validate,
  updateUser
);

router.post(
  '/:id/reset-password',
  authorize('Super Admin'),
  resetUserPassword
);

export default router;
