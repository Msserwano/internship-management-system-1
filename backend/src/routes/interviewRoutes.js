// backend/src/routes/interviewRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllInterviews,
  getInterviewById,
  scheduleInterview,
  updateInterview,
  deleteInterview,
} = require("../controllers/interviewController");
const { requireAuth, requireRole } = require("../middleware/authJwt");

// ── RETRIEVE (all / filtered) ─────────────────────────────────────────────
// GET /api/interviews?applicationId=APP001&status=scheduled
router.get("/", requireAuth, getAllInterviews);

// ── RETRIEVE BY ID ─────────────────────────────────────────────────────────
// GET /api/interviews/:id
router.get("/:id", requireAuth, getInterviewById);

// ── WRITE / STORE (schedule new interview) ────────────────────────────────
// POST /api/interviews  { applicationId, applicantName, date, time, venue, meetingLink }
router.post("/", requireAuth, requireRole(["hr","admin"]), scheduleInterview);

// ── EDIT / MODIFY (reschedule / update details) ───────────────────────────
// PUT /api/interviews/:id  { date, time, venue, status, ... }
router.put("/:id", requireAuth, updateInterview);

// ── DELETE / CANCEL ────────────────────────────────────────────────────────
// DELETE /api/interviews/:id
router.delete("/:id", requireAuth, requireRole(["admin"]), deleteInterview);

module.exports = router;
