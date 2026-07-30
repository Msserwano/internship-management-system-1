// backend/src/middleware/rateLimit.js
/**
 * Rate Limiting Middleware
 * Prevents abuse and protects against DoS attacks
 */
const logger = require("../config/logger");

// In-memory store for rate limiting (can be replaced with Redis for production)
const requests = new Map();

/**
 * Clean old entries (runs every 15 minutes)
 */
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  const maxAge = 15 * 60 * 1000; // 15 minutes

  for (const [key, times] of requests.entries()) {
    const recentTimes = times.filter((t) => now - t < maxAge);
    if (recentTimes.length === 0) {
      requests.delete(key);
    } else {
      requests.set(key, recentTimes);
    }
  }
}, 15 * 60 * 1000);
// Do not keep command-line tools and tests alive solely for housekeeping.
cleanupTimer.unref();

/**
 * Rate limiter middleware
 * @param {number} maxRequests - Maximum requests per time window
 * @param {number} windowMs - Time window in milliseconds
 */
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    // Scope a limit to a route group as well as an address. This prevents normal
    // API traffic from consuming the much stricter authentication allowance.
    const key = `${req.ip || req.connection.remoteAddress}:${req.baseUrl}`;
    const now = Date.now();

    // Get request times for this IP
    let times = requests.get(key) || [];

    // Filter out old requests outside the time window
    times = times.filter((t) => now - t < windowMs);

    // Check if rate limit exceeded
    if (times.length >= maxRequests) {
      logger.warn("Rate limit exceeded", { ip: key, requests: times.length });
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((times[0] + windowMs - now) / 1000),
      });
    }

    // Add current request time
    times.push(now);
    requests.set(key, times);

    // Add rate limit info to response headers
    res.set("X-RateLimit-Limit", maxRequests);
    res.set("X-RateLimit-Remaining", maxRequests - times.length);
    res.set("X-RateLimit-Reset", new Date(now + windowMs).toISOString());

    next();
  };
};

/**
 * No-op middleware used when rate limiting is disabled via env var.
 */
const noop = (req, res, next) => next();

/**
 * Allow disabling rate limiting by setting DISABLE_RATE_LIMIT=true
 */
const isDisabled = process.env.DISABLE_RATE_LIMIT === "true";

const authRateLimit = isDisabled
  ? noop
  : rateLimit(5, 15 * 60 * 1000); // 5 requests per 15 minutes

const apiRateLimit = isDisabled
  ? noop
  : rateLimit(100, 15 * 60 * 1000); // 100 requests per 15 minutes

const resetRateLimits = () => requests.clear();

module.exports = {
  rateLimit,
  authRateLimit,
  apiRateLimit,
  resetRateLimits,
};
