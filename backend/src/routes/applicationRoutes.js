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
const { requireAuth, requireRole } = require("../middleware/authJwt");

// ── RETRIEVE (all / filtered) ─────────────────────────────────────────────
// GET /api/applications?applicantId=U001&internshipId=INT001&status=shortlisted
router.get("/", requireAuth, getAllApplications);

// ── RETRIEVE BY ID ─────────────────────────────────────────────────────────
// GET /api/applications/:id
router.get("/:id", requireAuth, getApplicationById);

// ── WRITE / STORE (submit new application) ────────────────────────────────
// POST /api/applications  { internshipId, applicantId, university, course, gpa }
// Allow public submissions (everyone can apply). Authenticated users still work.
router.post("/", submitApplication);

// Assign an application to an HR user
router.post('/:id/assign', requireAuth, requireRole(['hr','admin']), require('../controllers/applicationController').assignApplication);

// ── EDIT / MODIFY (update status / review note) ───────────────────────────
// PUT /api/applications/:id  { status, reviewNote, ... }
router.put("/:id", requireAuth, updateApplication);

// ── DELETE ─────────────────────────────────────────────────────────────────
// DELETE /api/applications/:id
router.delete("/:id", requireAuth, requireRole(["admin"]), deleteApplication);

module.exports = router;
