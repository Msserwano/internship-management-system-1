// backend/src/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Safe require for optional middleware to allow server start when deps missing
const safeRequire = (name) => {
  try {
    return require(name);
  } catch (err) {
    // Use console.warn directly because logger may depend on other modules
    console.warn(`[WARN] Optional dependency '${name}' is not installed. Feature disabled.`);
    return null;
  }
};

const helmet = safeRequire("helmet");
const compression = safeRequire("compression");
const swaggerUi = safeRequire("swagger-ui-express");
const swaggerSpec = safeRequire("./config/swagger") || require("./config/swagger");
const logger = require("./config/logger");

// Middleware
const requestLogger = require("./middleware/requestLogger");
const { errorHandler, notFoundHandler, asyncHandler } = require("./middleware/errorHandler");
const { apiRateLimit, authRateLimit } = require("./middleware/rateLimit");

// Routes
const authRoutes = require("./routes/authRoutes");
const internshipRoutes = require("./routes/internshipRoutes");
const userRoutes = require("./routes/userRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

const app = express();

// ── Security Middleware ────────────────────────────────────────────────────
if (helmet) app.use(helmet());
else console.warn("[WARN] 'helmet' not available — skipping security headers middleware.");

if (compression) app.use(compression());
else console.warn("[WARN] 'compression' not available — skipping response compression.");

// ── CORS Configuration ────────────────────────────────────────────────────
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
};
app.use(cors(corsOptions));

// ── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ── Static Files ───────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Request Logging ────────────────────────────────────────────────────────
app.use(requestLogger);

// ── API Documentation ────────────────────────────────────────────────────────
if (swaggerUi) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      docExpansion: "list",
      supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
    },
  }));
} else {
  console.warn("[WARN] 'swagger-ui-express' not available — /api-docs disabled.");
}

// ── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "KCCA IMS Backend API",
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
  });
});

// ── API Routes ───────────────────────────────────────────────────────────────
// Auth routes with strict rate limiting
app.use("/api/auth", authRateLimit, authRoutes);

// Protected routes with standard rate limiting
app.use("/api/internships", apiRateLimit, internshipRoutes);
app.use("/api/users", apiRateLimit, userRoutes);
app.use("/api/applications", apiRateLimit, applicationRoutes);
app.use("/api/interviews", apiRateLimit, interviewRoutes);

// ── 404 Handler ────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ── Error Handling Middleware (Must be last) ────────────────────────────────
app.use(errorHandler);

// Initialize database
const { testConnection, initializeSchema, seedDemoUsers } = require("./config/database");

app.initializeDatabase = async () => {
  try {
    const connected = await testConnection();
    if (connected) {
      await initializeSchema();
      await seedDemoUsers();
      logger.info("Database initialization complete");
    }
  } catch (err) {
    logger.error("Database initialization failed", { error: err.message });
  }
};

module.exports = app;
