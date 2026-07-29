// backend/src/validators/validate.js
/**
 * Validation Middleware
 */
const logger = require("../config/logger");

/**
 * Create validation middleware
 */
const validate = (schema, source = "body") => {
  return async (req, res, next) => {
    try {
      const data = source === "body" ? req.body : source === "query" ? req.query : req.params;
      const validated = await schema.parseAsync(data);

      // Attach validated data to request
      if (source === "body") req.body = validated;
      else if (source === "query") req.query = validated;
      else req.params = validated;

      next();
    } catch (err) {
      if (err.name === "ZodError") {
        logger.warn("Validation error", { errors: err.errors });
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: err.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }

      logger.error("Validation error", { error: err.message });
      return res.status(500).json({
        success: false,
        message: "Internal server error during validation",
      });
    }
  };
};

module.exports = validate;
