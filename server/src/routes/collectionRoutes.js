import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import * as collectionController from '../controllers/collectionController.js';

const router = Router();

router.use(requireAuth);
router.get('/', collectionController.getCollections);
router.post('/', collectionController.createCollection);
router.patch('/:id', collectionController.renameCollection);
router.delete('/:id', collectionController.deleteCollection);
router.post('/:id/recipes/:recipeId', collectionController.addRecipe);
router.delete('/:id/recipes/:recipeId', collectionController.removeRecipe);
router.post('/shopping-list', collectionController.getShoppingList);

export default router;
