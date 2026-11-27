const express = require('express');
const recipeController = require('../controllers/recipeController');
const reviewController = require('../controllers/reviewController');
const commentController = require('../controllers/commentController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
const recipeImages = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'stepImages', maxCount: 10 },
]);

router.get('/', optionalAuth, recipeController.list);
router.post('/', requireAuth, recipeImages, recipeController.create);
router.post('/upload', requireAuth, upload.single('image'), recipeController.uploadImage);
router.get('/:id/reviews', reviewController.list);
router.post('/:id/reviews', requireAuth, upload.array('photos', 5), reviewController.create);
router.get('/:id/comments', commentController.list);
router.post('/:id/comments', requireAuth, commentController.create);
router.get('/:id', optionalAuth, recipeController.get);
router.patch('/:id', requireAuth, recipeImages, recipeController.update);
router.delete('/:id', requireAuth, recipeController.remove);

module.exports = router;
