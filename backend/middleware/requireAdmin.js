const AppError = require('../utils/AppError');

module.exports = function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return next(new AppError('Administrator access is required.', 403));
  }
  next();
};
