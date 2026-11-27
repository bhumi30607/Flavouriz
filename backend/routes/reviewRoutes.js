const express = require('express');
const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.patch('/:id', requireAuth, upload.array('photos', 5), reviewController.update);
router.delete('/:id', requireAuth, reviewController.remove);
router.post('/:id/helpful', requireAuth, reviewController.helpful);

module.exports = router;
