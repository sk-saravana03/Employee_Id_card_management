import express from 'express';
import { checkInAttendance, checkOutAttendance, getAttendanceLogs } from '../controllers/attendance.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { verifySession } from '../middleware/session.middleware.js';

const router = express.Router();

router.use(protect);
router.use(verifySession);

router.get('/', getAttendanceLogs);
router.post('/check-in', checkInAttendance);
router.post('/check-out', checkOutAttendance);

export default router;
