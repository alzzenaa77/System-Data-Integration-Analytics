const { validateToken } = require('../services/authService');

/**
 * Middleware to authenticate JWT token
 * Extracts token from Authorization header and validates it
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Token tidak ditemukan'
    });
  }

  const validation = validateToken(token);

  if (!validation.valid) {
    return res.status(401).json({
      error: validation.error
    });
  }

  // Attach user info to request
  req.user = {
    id: validation.userId,  // Add 'id' for backward compatibility
    userId: validation.userId,
    role: validation.role,
    username: validation.username
  };

  next();
}

/**
 * Middleware to authorize based on user roles
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware function
 */
function authorizeRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autentikasi diperlukan'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Anda tidak memiliki akses ke resource ini'
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRole
};
