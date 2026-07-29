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

// ── RETRIEVE (all / filtered) ─────────────────────────────────────────────
// GET /api/interviews?applicationId=APP001&status=scheduled
router.get("/", getAllInterviews);

// ── RETRIEVE BY ID ─────────────────────────────────────────────────────────
// GET /api/interviews/:id
router.get("/:id", getInterviewById);

// ── WRITE / STORE (schedule new interview) ────────────────────────────────
// POST /api/interviews  { applicationId, applicantName, date, time, venue, meetingLink }
router.post("/", scheduleInterview);

// ── EDIT / MODIFY (reschedule / update details) ───────────────────────────
// PUT /api/interviews/:id  { date, time, venue, status, ... }
router.put("/:id", updateInterview);

// ── DELETE / CANCEL ────────────────────────────────────────────────────────
// DELETE /api/interviews/:id
router.delete("/:id", deleteInterview);

module.exports = router;
