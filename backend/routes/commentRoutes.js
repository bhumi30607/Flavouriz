const express = require('express');
const commentController = require('../controllers/commentController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.patch('/:id', requireAuth, commentController.update);
router.delete('/:id', requireAuth, commentController.remove);

module.exports = router;
