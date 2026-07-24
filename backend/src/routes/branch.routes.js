import express from 'express';
import {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
} from '../controllers/branch.controller.js';
import {
  createBranchValidator,
  updateBranchValidator,
} from '../validators/branch.validator.js';
import validate from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import { verifySession } from '../middleware/session.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(protect);
router.use(verifySession);

router.get('/', getBranches);
router.get('/:id', getBranchById);

router.post(
  '/',
  authorize('Super Admin'),
  createBranchValidator,
  validate,
  createBranch
);

router.put(
  '/:id',
  authorize('Super Admin'),
  updateBranchValidator,
  validate,
  updateBranch
);

router.delete(
  '/:id',
  authorize('Super Admin'),
  deleteBranch
);

export default router;
