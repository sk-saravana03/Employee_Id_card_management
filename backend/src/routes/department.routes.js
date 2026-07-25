import express from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/department.controller.js';
import {
  createDepartmentValidator,
  updateDepartmentValidator,
} from '../validators/department.validator.js';
import validate from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import { verifySession } from '../middleware/session.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(protect);
router.use(verifySession);

router.get('/', authorize('Super Admin', 'HR/Admin', 'Printer Operator', 'Security Officer'), getDepartments);
router.get('/:id', authorize('Super Admin', 'HR/Admin', 'Printer Operator', 'Security Officer'), getDepartmentById);

router.post(
  '/',
  authorize('Super Admin', 'HR/Admin'),
  createDepartmentValidator,
  validate,
  createDepartment
);

router.put(
  '/:id',
  authorize('Super Admin', 'HR/Admin'),
  updateDepartmentValidator,
  validate,
  updateDepartment
);

router.delete(
  '/:id',
  authorize('Super Admin'),
  deleteDepartment
);

export default router;
