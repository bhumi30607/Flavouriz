const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const recipeController = require('../controllers/recipeController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const imageService = require('../services/imageService');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.get('/me/recipes', requireAuth, recipeController.myRecipes);
router.patch('/me', requireAuth, upload.single('avatar'), asyncHandler(async (req, res, next) => {
  if (req.file) req.uploadedAvatar = await imageService.uploadImage(req.file, `users/${req.user.id}/avatars`);
  next();
}), authController.updateProfile);
router.post('/:id/follow', requireAuth, userController.follow);
router.delete('/:id/follow', requireAuth, userController.unfollow);
router.get('/:id/followers', userController.followers);
router.get('/:id/following', userController.following);
router.get('/:id', optionalAuth, userController.profile);

module.exports = router;
