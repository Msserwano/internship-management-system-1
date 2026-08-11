
const express = require("express");
const router  = express.Router();
const {
  submitEvaluation,
  getMyEvaluations,
  getAllEvaluations,
  getEvaluationById,
} = require("../controllers/evaluationController");
const { requireAuth, requireRole } = require("../middleware/authJwt");

// Applicant: fetch their own evaluations
router.get("/my",  requireAuth, getMyEvaluations);

// HR/Admin: fetch all evaluations (with optional filters)
router.get("/",    requireAuth, requireRole(["hr", "admin"]), getAllEvaluations);

// Get single evaluation by ID
router.get("/:id", requireAuth, getEvaluationById);

// Applicant: submit an evaluation
router.post("/",   requireAuth, submitEvaluation);

module.exports = router;
