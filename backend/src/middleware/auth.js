const { verifyToken } = require('../utils/jwt');

/**
 * Authenticate user from JWT token
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

/**
 * Authorize user by role
 * @param {...string} allowedRoles - Roles allowed to access
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Required role: ' + allowedRoles.join(' or '),
        userRole: req.user.role,
        requiredRoles: allowedRoles
      });
    }

    next();
  };
};

/**
 * Aliases for backward compatibility with standard Express pattern
 */
const checkLogin = authenticate;
const checkRole = (...roles) => authorize(...roles);

module.exports = {
  authenticate,
  authorize,
  checkLogin,
  checkRole
};
