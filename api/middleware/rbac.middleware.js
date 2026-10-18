/**
 * @file apps/api/middleware/rbac.middleware.js
 * @description Role-based and Permission-based access control guards
 */

import { ApiError } from './error.middleware.js';

/**
 * Restricts access to users having one of the specified roles.
 * Super_admin and admin bypass all standard role requirements.
 * @param  {...string} allowedRoles 
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const userRole = (req.user.role || '').toLowerCase();
    const isSuperAdmin = userRole === 'super_admin';
    const isAdmin = userRole === 'admin';

    if (isSuperAdmin || isAdmin) {
      return next();
    }

    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

    // 'user' allows any authenticated active role
    if (normalizedAllowed.includes('user')) {
      return next();
    }

    // Also support checking userTypes for sellers/providers
    const userTypes = Array.isArray(req.user.userTypes)
      ? req.user.userTypes.map((t) => t.toLowerCase())
      : [];

    const hasDirectRole = normalizedAllowed.includes(userRole);
    const hasUserTypeMatch = normalizedAllowed.some((r) => userTypes.includes(r));

    if (hasDirectRole || hasUserTypeMatch) {
      return next();
    }

    return next(
      ApiError.forbidden(
        `Action requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: ${userRole}`
      )
    );
  };
};

/**
 * Convenience guards
 */
export const requireAdmin = requireRole('admin', 'super_admin');
export const requireModerator = requireRole('moderator', 'admin', 'super_admin');
export const requireSeller = requireRole('seller', 'admin', 'super_admin');
export const requireProvider = requireRole('provider', 'admin', 'super_admin');

export default {
  requireRole,
  requireAdmin,
  requireModerator,
  requireSeller,
  requireProvider
};
