
const express = require('express');
const router = express.Router();
const { getAllApplicants, getApplicantById } = require('../controllers/applicantController');
const { requireAuth, requireRole } = require('../middleware/authJwt');

// HR and Admin can view all applicants
router.get('/', requireAuth, requireRole(['hr', 'admin']), getAllApplicants);

// View single applicant profile (includes their applications)
router.get('/:id', requireAuth, requireRole(['hr', 'admin']), getApplicantById);

module.exports = router;
