
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



router.get("/", requireAuth, getAllInterviews);



router.get("/:id", requireAuth, getInterviewById);



router.post("/", requireAuth, requireRole(["hr","admin"]), scheduleInterview);



router.put("/:id", requireAuth, updateInterview);



router.delete("/:id", requireAuth, requireRole(["admin"]), deleteInterview);

module.exports = router;
