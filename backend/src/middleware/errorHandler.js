

const logger = require("../config/logger");

const isDevelopment = process.env.NODE_ENV === "development";


const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};


const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error("Request error", {
    statusCode,
    message,
    method: req.method,
    url: req.originalUrl,
    stack: isDevelopment ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDevelopment ? { stack: err.stack } : {}),
    timestamp: new Date().toISOString(),
  });
};


const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};


const validationErrorHandler = (err, req, res, next) => {
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }
  next(err);
};



module.exports = {
  asyncHandler,
  errorHandler,
  notFoundHandler,
  validationErrorHandler,
};
