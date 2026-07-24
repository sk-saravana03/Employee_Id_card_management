import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  bulkImportEmployees,
  deleteEmployee,
} from '../controllers/employee.controller.js';
import {
  createEmployeeValidator,
  updateEmployeeValidator,
} from '../validators/employee.validator.js';
import validate from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import { verifySession } from '../middleware/session.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(protect);
router.use(verifySession);

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);

router.post(
  '/',
  authorize('Super Admin', 'HR/Admin'),
  createEmployeeValidator,
  validate,
  createEmployee
);

router.put(
  '/:id',
  authorize('Super Admin', 'HR/Admin'),
  updateEmployeeValidator,
  validate,
  updateEmployee
);

router.patch(
  '/:id/status',
  authorize('Super Admin', 'HR/Admin'),
  updateEmployeeStatus
);

router.post(
  '/bulk-import',
  authorize('Super Admin', 'HR/Admin'),
  bulkImportEmployees
);

router.delete(
  '/:id',
  authorize('Super Admin'),
  deleteEmployee
);

export default router;
