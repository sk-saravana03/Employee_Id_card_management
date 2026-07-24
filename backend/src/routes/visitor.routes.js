import express from 'express';
import {
  getVisitors,
  getVisitorById,
  registerVisitor,
  updateVisitorApproval,
  checkInVisitor,
  checkOutVisitor,
  cleanupExpiredVisitors,
} from '../controllers/visitor.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { verifySession } from '../middleware/session.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(protect);
router.use(verifySession);

// ── Visitor Registration: Security Officers & Super Admin only ────────────────
// Admins (HR/Admin) can VIEW but NOT CREATE visitor passes — only Security Officers register at gate
router.post(
  '/register',
  authorize('Super Admin', 'Security Officer'),
  registerVisitor
);

// ── Visitor CRUD & Status ─────────────────────────────────────────────────────
router.get('/', getVisitors);
router.get('/:id', getVisitorById);

// Approval: HR/Admin + Security Officer + Super Admin can approve/reject
router.patch('/:id/approval', authorize('Super Admin', 'HR/Admin', 'Security Officer'), updateVisitorApproval);

// Check-In / Check-Out: Security gate operations — Security Officer only
router.post('/:id/check-in',  authorize('Super Admin', 'Security Officer'), checkInVisitor);
router.post('/:id/check-out', authorize('Super Admin', 'Security Officer'), checkOutVisitor);

// ── Admin Cleanup: manually purge expired visitor records ─────────────────────
router.delete('/cleanup-expired', authorize('Super Admin', 'HR/Admin'), cleanupExpiredVisitors);

export default router;
