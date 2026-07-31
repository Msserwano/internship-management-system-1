
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



router.get("/", requireAuth, getAllApplications);



router.get("/:id", requireAuth, getApplicationById);




router.post("/", submitApplication);


router.post('/:id/assign', requireAuth, requireRole(['hr','admin']), require('../controllers/applicationController').assignApplication);



router.put("/:id", requireAuth, updateApplication);



router.delete("/:id", requireAuth, requireRole(["admin"]), deleteApplication);

module.exports = router;
