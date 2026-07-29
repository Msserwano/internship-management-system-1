// backend/src/server.js
require("dotenv").config(); // Must be first — loads .env before anything else
const app = require("./app");
const logger = require("./config/logger");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize database. In development and CI we allow the server to start
    // even when the database is not available. In production we require it.
    const databaseReady = await app.initializeDatabase();

    if (!databaseReady) {
      const isProd = process.env.NODE_ENV === "production";
      if (isProd) {
        throw new Error("Database connection is required to start the API in production.");
      } else {
        // Log a clear warning and continue — many developer workflows run without a DB
        logger.warn("Database is not available — continuing startup in non-production mode. Some features will be disabled.");
      }
    }

    const server = app.listen(PORT, () => {
      logger.info(`KCCA IMS API Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received, shutting down gracefully");
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      logger.info("SIGINT received, shutting down gracefully");
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    });
  } catch (err) {
    logger.error("Failed to start server", { error: err.message });
    process.exit(1);
  }
};

startServer();
