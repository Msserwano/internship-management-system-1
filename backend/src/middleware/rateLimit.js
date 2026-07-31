


const noop = (req, res, next) => next();


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

