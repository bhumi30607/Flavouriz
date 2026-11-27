const multer = require('multer');

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, files: 10 },
  fileFilter(req, file, callback) {
    if (!allowedTypes.has(file.mimetype.toLowerCase())) {
      const error = new Error('Only JPEG, PNG, WEBP, and GIF image files are allowed.');
      error.statusCode = 400;
      return callback(error);
    }
    callback(null, true);
  },
});

module.exports = upload;
