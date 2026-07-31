
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET;

if (process.env.NODE_ENV === "production" && !JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in production.");
}


const requireAuth = (req, res, next) => {
  const authHeader = req.get('Authorization') || req.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token missing.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET || "development-only-secret");
    req.user = payload;
    next();
  } catch (err) {
    logger.warn('JWT verification failed', { error: err.message });
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};


const requireRole = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const userRole = (req.user.role || '').toLowerCase();
  const allowed = allowedRoles.map(r => r.toLowerCase());
  if (!allowed.includes(userRole)) {
    return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
  }
  next();
};


const requireSelfOrRole = (idParam = "id", allowedRoles = ["hr", "admin"]) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (allowedRoles.includes(String(req.user.role).toLowerCase()) || String(req.user.id) === String(req.params[idParam])) {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden: insufficient permissions" });
};

module.exports = { requireAuth, requireRole, requireSelfOrRole };
