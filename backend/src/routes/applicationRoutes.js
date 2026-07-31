
const express = require("express");
const router = express.Router();
const {
  getAllApplications,
  getApplicationById,
  submitApplication,
  updateApplication,
  deleteApplication,
  assignApplication,
} = require("../controllers/applicationController");
const { requireAuth, requireRole } = require("../middleware/authJwt");

// List — staff see all; applicants see only their own (filtered in controller)
router.get("/", requireAuth, getAllApplications);

// Get single application
router.get("/:id", requireAuth, getApplicationById);

// Submit — applicant must be authenticated to link applicant_id FK
router.post("/", requireAuth, submitApplication);

// Assign to HR officer
router.post("/:id/assign", requireAuth, requireRole(["hr", "admin"]), assignApplication);

// Update status / review note
router.put("/:id", requireAuth, updateApplication);

// Hard delete — admin only
router.delete("/:id", requireAuth, requireRole(["admin"]), deleteApplication);

module.exports = router;
