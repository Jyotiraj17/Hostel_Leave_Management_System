const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${req.user ? req.user.role : 'User'} role is not authorized for this resource.`
      });
    }
    next();
  };
};

module.exports = authorizeRole;
