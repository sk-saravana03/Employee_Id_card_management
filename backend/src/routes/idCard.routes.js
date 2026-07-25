import express from 'express';
import {
  getIdCards,
  getIdCardById,
  getMyIdCardRequest,
  requestPhysicalCard,
  hrApproveCard,
  adminApproveCard,
  markCardAsPrinted,
  rejectCardRequest,
  generateIdCard,
  updateIdCardStatus,
} from '../controllers/idCard.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { verifySession } from '../middleware/session.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(protect);
router.use(verifySession);

router.get('/', getIdCards);
router.get('/my-request', getMyIdCardRequest);
router.get('/:id', getIdCardById);

// Stage 1: Request Physical Card (Employee / All users)
router.post('/request', requestPhysicalCard);
router.post('/generate', generateIdCard);

// Stage 2: HR / Manager Approval
router.patch('/:id/hr-approve', authorize('Super Admin', 'HR/Admin'), hrApproveCard);

// Stage 3: Admin Approval
router.patch('/:id/admin-approve', authorize('Super Admin'), adminApproveCard);

// Stage 4: Printer Operator Processing
router.patch('/:id/print', authorize('Super Admin', 'Printer Operator'), markCardAsPrinted);

// Rejection
router.patch('/:id/reject', authorize('Super Admin', 'HR/Admin'), rejectCardRequest);

router.patch('/:id/status', authorize('Super Admin', 'HR/Admin', 'Printer Operator'), updateIdCardStatus);

export default router;
