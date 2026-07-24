/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if user's role name matches allowed roles.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Role authorization details missing.',
      });
    }

    const userRoleName = req.user.role.name;

    // Super Admin bypasses all checks
    if (userRoleName === 'Super Admin') {
      return next();
    }

    if (!allowedRoles.includes(userRoleName)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${userRoleName}' does not have sufficient privileges for this action.`,
      });
    }

    next();
  };
};

/**
 * Permission-based Check Middleware
 */
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const userRole = req.user.role;
    if (userRole.name === 'Super Admin') {
      return next();
    }

    if (!userRole.permissions || !userRole.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Missing required permission: ${requiredPermission}`,
      });
    }

    next();
  };
};

export { authorize, checkPermission };
