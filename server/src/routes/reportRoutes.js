import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/requireRole.js';

const router = Router();

router.post('/', requireAuth, reportController.createReport);
router.get('/', requireAuth, requireAdmin, reportController.getReports);
router.patch('/:id', requireAuth, requireAdmin, reportController.resolveReport);

export default router;
