// backend/src/middleware/authJwt.js
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'kcca_internship_jwt_secret_fallback';

/**
 * Verify JWT in Authorization header 'Bearer <token>'
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.get('Authorization') || req.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token missing.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    logger.warn('JWT verification failed', { error: err.message });
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

/**
 * Require that the authenticated user has one of the allowed roles
 * @param {string[]} allowedRoles
 */
const requireRole = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const userRole = (req.user.role || '').toLowerCase();
  const allowed = allowedRoles.map(r => r.toLowerCase());
  if (!allowed.includes(userRole)) {
    return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
  }
  next();
};

module.exports = { requireAuth, requireRole };
