
require("dotenv").config();
const app = require("./app");
const logger = require("./config/logger");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {


    const databaseReady = await app.initializeDatabase();

    if (!databaseReady) {
      const isProd = process.env.NODE_ENV === "production";
      if (isProd) {
        throw new Error("Database connection is required to start the API in production.");
      } else {

        logger.warn("Database is not available — continuing startup in non-production mode. Some features will be disabled.");
      }
    }

    const server = app.listen(PORT, () => {
      logger.info(`KCCA IMS API Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });


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
