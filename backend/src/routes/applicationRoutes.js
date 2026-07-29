// backend/src/routes/applicationRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllApplications,
  getApplicationById,
  submitApplication,
  updateApplication,
  deleteApplication,
} = require("../controllers/applicationController");

// ── RETRIEVE (all / filtered) ─────────────────────────────────────────────
// GET /api/applications?applicantId=U001&internshipId=INT001&status=shortlisted
router.get("/", getAllApplications);

// ── RETRIEVE BY ID ─────────────────────────────────────────────────────────
// GET /api/applications/:id
router.get("/:id", getApplicationById);

// ── WRITE / STORE (submit new application) ────────────────────────────────
// POST /api/applications  { internshipId, applicantId, university, course, gpa }
router.post("/", submitApplication);

// ── EDIT / MODIFY (update status / review note) ───────────────────────────
// PUT /api/applications/:id  { status, reviewNote, ... }
router.put("/:id", updateApplication);

// ── DELETE ─────────────────────────────────────────────────────────────────
// DELETE /api/applications/:id
router.delete("/:id", deleteApplication);

module.exports = router;
