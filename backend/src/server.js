// backend/src/server.js
require("dotenv").config(); // Must be first — loads .env before anything else
const app = require("./app");
const logger = require("./config/logger");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize database
    await app.initializeDatabase();

    const server = app.listen(PORT, () => {
      logger.info(`KCCA IMS API Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
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
