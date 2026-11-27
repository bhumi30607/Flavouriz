const express = require('express');
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.post('/', requireAuth, reportController.create);

module.exports = router;
