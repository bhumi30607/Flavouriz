const User = require('../models/User');
const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/token');
const asyncHandler = require('../utils/asyncHandler');
const { serializeUser } = require('../utils/serialize');

const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.token;
  if (!token) throw new AppError('Authentication required. Please log in.', 401);

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new AppError('Invalid or expired session. Please log in again.', 401);
  }

  const user = await User.findById(payload.id);
  if (!user || !user.isActive) throw new AppError('Account no longer exists or is inactive.', 401);
  req.user = serializeUser(user);
  next();
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.token;
  if (token) {
    try {
      const payload = verifyToken(token);
      const user = await User.findById(payload.id);
      if (user?.isActive) req.user = serializeUser(user);
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return next();
      }
      throw error;
    }
  }
  next();
});

module.exports = { requireAuth, optionalAuth };
