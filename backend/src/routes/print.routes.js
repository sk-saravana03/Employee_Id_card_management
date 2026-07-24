import express from 'express';
import {
  getPrintQueue,
  getPrinterHardware,
  togglePrinterPause,
  processPrintJob,
  requestReprint,
} from '../controllers/print.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { verifySession } from '../middleware/session.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(protect);
router.use(verifySession);

router.get('/queue', getPrintQueue);
router.get('/hardware', getPrinterHardware);

router.patch('/hardware/:id/toggle-pause', authorize('Super Admin', 'Printer Operator'), togglePrinterPause);
router.post('/jobs/:id/process', authorize('Super Admin', 'Printer Operator'), processPrintJob);
router.post('/reprint', authorize('Super Admin', 'HR/Admin', 'Printer Operator'), requestReprint);

export default router;
