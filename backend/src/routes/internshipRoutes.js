
const express = require("express");
const router = express.Router();
const {
  getAllInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
} = require("../controllers/internshipController");
const { requireAuth, requireRole } = require("../middleware/authJwt");

router.get("/",       getAllInternships);
router.get("/:id",    getInternshipById);
router.post("/",      requireAuth, requireRole(["hr","admin"]), createInternship);
router.put("/:id",    requireAuth, requireRole(["hr","admin"]), updateInternship);
router.delete("/:id", requireAuth, requireRole(["hr", "admin"]), deleteInternship);

module.exports = router;
