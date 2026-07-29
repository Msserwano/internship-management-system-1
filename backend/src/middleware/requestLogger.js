// backend/src/middleware/requestLogger.js
/**
 * HTTP Request Logging Middleware
 */
const logger = require("../config/logger");

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.http(req.method, req.originalUrl, null, 0, {
    userAgent: req.get("user-agent"),
    ip: req.ip,
  });

  // Intercept response to log response details
  const originalSend = res.send;

  res.send = function (data) {
    const duration = Date.now() - startTime;
    logger.http(req.method, req.originalUrl, res.statusCode, duration, {
      userAgent: req.get("user-agent"),
      ip: req.ip,
    });

    res.send = originalSend;
    return res.send(data);
  };

  next();
};

module.exports = requestLogger;
