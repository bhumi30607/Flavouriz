const express = require('express');
const uploadController = require('../controllers/uploadController');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
router.post('/signature', requireAuth, uploadController.signature);
router.post('/', requireAuth, upload.array('images', 10), uploadController.upload);

module.exports = router;
