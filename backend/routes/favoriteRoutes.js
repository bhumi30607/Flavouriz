const express = require('express');
const favoriteController = require('../controllers/favoriteController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);
router.get('/', favoriteController.list);
router.post('/:recipeId', favoriteController.add);
router.delete('/:recipeId', favoriteController.remove);

module.exports = router;
