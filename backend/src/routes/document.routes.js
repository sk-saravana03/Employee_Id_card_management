import express from 'express';
import { getDocuments, uploadDocument, deleteDocument } from '../controllers/document.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { verifySession } from '../middleware/session.middleware.js';

const router = express.Router();

router.use(protect);
router.use(verifySession);

router.get('/', getDocuments);
router.post('/upload', uploadDocument);
router.delete('/:id', deleteDocument);

export default router;
