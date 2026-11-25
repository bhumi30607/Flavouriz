import { Router } from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.patch('/:id', requireAuth, reviewController.updateReview);
router.delete('/:id', requireAuth, reviewController.deleteReview);

export default router;
