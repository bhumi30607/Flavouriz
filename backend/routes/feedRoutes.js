const express = require('express');
const feedController = require('../controllers/feedController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.get('/', requireAuth, feedController);

module.exports = router;
