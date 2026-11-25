/**
 * Restrict endpoint to specific roles (e.g. 'admin')
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You do not have permission to perform this action.',
      });
    }

    next();
  };
}

export const requireAdmin = requireRole('admin');
