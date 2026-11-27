const express = require('express');
const collectionController = require('../controllers/collectionController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);
router.get('/', collectionController.list);
router.post('/', collectionController.create);
router.post('/shopping-list', collectionController.shoppingList);
router.patch('/:id', collectionController.rename);
router.delete('/:id', collectionController.remove);
router.post('/:id/recipes/:recipeId', collectionController.addRecipe);
router.delete('/:id/recipes/:recipeId', collectionController.removeRecipe);

module.exports = router;
