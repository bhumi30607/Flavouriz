import { Router } from 'express';
import * as commentController from '../controllers/commentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.patch('/:id', requireAuth, commentController.updateComment);
router.delete('/:id', requireAuth, commentController.deleteComment);

export default router;
