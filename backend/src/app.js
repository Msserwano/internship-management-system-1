// backend/src/app.js
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────────────────────────────────
const authRoutes         = require("./routes/authRoutes");
const internshipRoutes   = require("./routes/internshipRoutes");
const userRoutes         = require("./routes/userRoutes");
const applicationRoutes  = require("./routes/applicationRoutes");
const interviewRoutes    = require("./routes/interviewRoutes");

// Auth
app.use("/api/auth",         authRoutes);

// Internships  — Write | Edit | Delete | Retrieve | Modify | Store
app.use("/api/internships",  internshipRoutes);

// Users        — Write | Edit | Delete | Retrieve | Modify | Store
app.use("/api/users",        userRoutes);

// Applications — Write | Edit | Delete | Retrieve | Modify | Store
app.use("/api/applications", applicationRoutes);

// Interviews   — Write | Edit | Delete | Retrieve | Modify | Store
app.use("/api/interviews",   interviewRoutes);

// ── Health check ─────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "KCCA IMS Backend API",
    timestamp: new Date(),
    routes: [
      "GET|POST        /api/auth/*",
      "GET|POST|PUT|DELETE /api/internships",
      "GET|POST|PUT|DELETE /api/users",
      "GET|POST|PUT|DELETE /api/applications",
      "GET|POST|PUT|DELETE /api/interviews",
    ],
  });
});

// ── 404 Fallback ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found.` });
});

module.exports = app;
