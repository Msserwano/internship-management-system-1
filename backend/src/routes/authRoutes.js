// backend/src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { registerUser, verifyEmail, resendVerification, loginUser } = require("../controllers/authController");

router.post("/register",             registerUser);
router.post("/verify-email",         verifyEmail);
router.post("/resend-verification",  resendVerification);
router.post("/login",                loginUser);

module.exports = router;
