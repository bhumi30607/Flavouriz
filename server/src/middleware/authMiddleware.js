import { verifyToken } from '../utils/token.js';
import * as storage from '../services/storageService.js';

/**
 * Protect routes by requiring valid JWT token
 */
export async function requireAuth(req, res, next) {
  try {
    let token = null;

    // Check Authorization header: "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // Check HTTP-only cookie
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in to continue.',
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please log in again.',
      });
    }

    // Verify user still exists in database
    const user = await storage.findById('users', decoded.id);
    if (!user || user.isActive === false) {
      return res.status(401).json({
        success: false,
        error: 'Account no longer exists or is inactive.',
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      name: user.name,
      avatar: user.avatar,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication: attaches user if valid token present, continues if not
 */
export async function optionalAuth(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await storage.findById('users', decoded.id);
        if (user && user.isActive !== false) {
          req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            name: user.name,
            avatar: user.avatar,
          };
        }
      } catch (_) {
        // Token invalid, ignore for optional auth
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}
