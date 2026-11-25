import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import * as reportController from '../controllers/reportController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/requireRole.js';

const router = Router();

// Protect all admin routes
router.use(requireAuth, requireAdmin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.patch('/recipes/:id/featured', adminController.toggleRecipeFeatured);

// Admin reports management
router.get('/reports', reportController.getReports);
router.patch('/reports/:id', reportController.resolveReport);

export default router;
