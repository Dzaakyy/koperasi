const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }

    const allowedRoles = roles.flat();
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }

    next();
  };
};

module.exports = authorize;
module.exports.authorize = authorize;
