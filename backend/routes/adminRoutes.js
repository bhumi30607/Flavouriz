const express = require('express');
const adminController = require('../controllers/adminController');
const recipeController = require('../controllers/recipeController');
const { requireAuth } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();
router.use(requireAuth, requireAdmin);
router.get('/stats', adminController.stats);
router.get('/users', adminController.users);
router.patch('/users/:id/role', adminController.updateRole);
router.patch('/users/:id/status', adminController.toggleStatus);
router.get('/reports', adminController.reports);
router.patch('/reports/:id', adminController.resolveReport);
router.patch('/recipes/:id/featured', recipeController.toggleFeatured);

module.exports = router;
