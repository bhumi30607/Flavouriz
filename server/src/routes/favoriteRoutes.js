import { Router } from 'express';
import * as favoriteController from '../controllers/favoriteController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', favoriteController.getFavorites);
router.post('/:recipeId', favoriteController.addFavorite);
router.delete('/:recipeId', favoriteController.removeFavorite);

export default router;
