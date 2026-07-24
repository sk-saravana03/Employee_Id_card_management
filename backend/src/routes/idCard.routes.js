import express from 'express';
import {
  getIdCards,
  getIdCardById,
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
router.get('/:id', getIdCardById);
router.post('/generate', authorize('Super Admin', 'HR/Admin'), generateIdCard);
router.patch('/:id/status', authorize('Super Admin', 'HR/Admin', 'Printer Operator'), updateIdCardStatus);

export default router;
