import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getFeed } from '../controllers/socialController.js';

const router = Router();

router.get('/', requireAuth, getFeed);

export default router;
