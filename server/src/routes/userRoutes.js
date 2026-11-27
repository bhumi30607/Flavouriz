import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import * as recipeController from '../controllers/recipeController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadRecipeImage } from '../middleware/uploadMiddleware.js';
import * as socialController from '../controllers/socialController.js';

const router = Router();

// Current user routes
router.get('/me/recipes', requireAuth, recipeController.getMyRecipes);
router.patch('/me', requireAuth, uploadRecipeImage.single('avatar'), userController.updateMyProfile);
router.post('/:id/follow', requireAuth, socialController.followUser);
router.delete('/:id/follow', requireAuth, socialController.unfollowUser);
router.get('/:id/followers', socialController.getFollowers);
router.get('/:id/following', socialController.getFollowing);

// Public profile route
router.get('/:id', userController.getUserProfile);

export default router;
