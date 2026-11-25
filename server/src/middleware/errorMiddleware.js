import multer from 'multer';

/**
 * 404 Route Not Found handler
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    statusCode: 404,
  });
}

/**
 * Centralized error-handling middleware
 */
export function errorHandler(err, req, res, next) {
  // Handle Multer upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum allowed size is 5MB.',
        statusCode: 400,
      });
    }
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`,
      statusCode: 400,
    });
  }

  // Handle JSON parse errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'Malformed JSON payload in request body.',
      statusCode: 400,
    });
  }

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const message = err.message || 'An unexpected internal server error occurred.';

  // In development, log the stack trace
  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    console.error('Unhandled Server Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
  });
}
