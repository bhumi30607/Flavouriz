const multer = require('multer');

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Image exceeds the 5MB upload limit.'
      : `Upload failed: ${error.message}`;
    return res.status(400).json({ success: false, error: message });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({ success: false, error: error.message });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ success: false, error: 'Invalid resource ID.' });
  }
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    return res.status(409).json({
      success: false,
      error: field ? `${field} is already in use.` : 'A record with these values already exists.',
    });
  }

  const status = error.statusCode || error.status || 500;
  if (status >= 500) console.error(error);
  return res.status(status).json({
    success: false,
    error: status >= 500 && process.env.NODE_ENV === 'production'
      ? 'An unexpected server error occurred.'
      : error.message || 'An unexpected server error occurred.',
  });
}

module.exports = errorHandler;
