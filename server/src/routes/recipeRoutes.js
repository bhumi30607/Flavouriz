import { Router } from 'express';
import * as recipeController from '../controllers/recipeController.js';
import * as reviewController from '../controllers/reviewController.js';
import * as commentController from '../controllers/commentController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import { uploadRecipeImage } from '../middleware/uploadMiddleware.js';

const router = Router();

// Recipe list and details
router.get('/', optionalAuth, recipeController.getRecipes);
router.get('/:id', optionalAuth, recipeController.getRecipeById);

// Create, update, delete
router.post('/', requireAuth, uploadRecipeImage.single('image'), recipeController.createRecipe);
router.patch('/:id', requireAuth, uploadRecipeImage.single('image'), recipeController.updateRecipe);
router.delete('/:id', requireAuth, recipeController.deleteRecipe);

// Standalone image upload
router.post('/upload', requireAuth, uploadRecipeImage.single('image'), recipeController.uploadImage);

// Nested reviews endpoints
router.get('/:id/reviews', reviewController.getReviewsForRecipe);
router.post('/:id/reviews', requireAuth, reviewController.addReview);

// Nested comments endpoints
router.get('/:id/comments', commentController.getCommentsForRecipe);
router.post('/:id/comments', requireAuth, commentController.addComment);

export default router;
