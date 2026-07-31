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
// Load swagger spec only if present; do NOT force require when missing
const swaggerSpec = safeRequire("./config/swagger");
const logger = require("./config/logger");

// Middleware
const requestLogger = require("./middleware/requestLogger");
const auditLogger = require("./middleware/auditLogger");
const { errorHandler, notFoundHandler, asyncHandler } = require("./middleware/errorHandler");
const { apiRateLimit, authRateLimit } = require("./middleware/rateLimit");

// Routes
const authRoutes = require("./routes/authRoutes");
const internshipRoutes = require("./routes/internshipRoutes");
const userRoutes = require("./routes/userRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const genericRoutes = require("./routes/genericRoutes");

const app = express();

// ── Security Middleware ────────────────────────────────────────────────────
if (helmet) app.use(helmet());
else console.warn("[WARN] 'helmet' not available — skipping security headers middleware.");

if (compression) app.use(compression());
else console.warn("[WARN] 'compression' not available — skipping response compression.");

// ── CORS Configuration ────────────────────────────────────────────────────
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
};
app.use(cors(corsOptions));

// ── Body Parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ── Static Files ─────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Request Logging ────────────────────────────────────────────────────────
app.use(requestLogger);
app.use(auditLogger);

// ── API Documentation ────────────────────────────────────────────────────────
// Only enable API docs when both swagger-ui-express and the swagger spec are available
if (swaggerUi && swaggerSpec) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        docExpansion: "list",
        supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
      },
    })
  );
} else if (swaggerUi && !swaggerSpec) {
  console.warn("[WARN] 'swagger-ui-express' is installed but './config/swagger' is missing — /api-docs disabled.");
} else {
  console.warn("[WARN] 'swagger-ui-express' not available — /api-docs disabled.");
}

// ── Health Check ─────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "KCCA IMS Backend API",
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
  });
});

// ── API Routes ──────────────────────────────────────────────────────────
// Auth routes
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/internships", internshipRoutes);
app.use("/api/users", userRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/notifications", notificationRoutes);
// Generic CRUD for allowed tables (users, internships, applications, interviews)
app.use('/api/data', genericRoutes);

// ── 404 Handler ─────────────────────────────────────────────────────────
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
    return connected;
  } catch (err) {
    logger.error("Database initialization failed", { error: err.message });
    return false;
  }
};

module.exports = app;
