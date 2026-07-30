// backend/src/middleware/rateLimit.js
/**
 * Rate Limiting Middleware
 * Rate limiting disabled per configuration.
 */

const noop = (req, res, next) => next();

/**
 * Rate limiter middleware (No-op)
 */
const rateLimit = () => noop;

const authRateLimit = noop;
const apiRateLimit = noop;
const resetRateLimits = () => {};

module.exports = {
  rateLimit,
  authRateLimit,
  apiRateLimit,
  resetRateLimits,
};

