// backend/src/controllers/authController.js
const { sendVerificationEmail } = require("../config/mailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../userStore.json");
const JWT_SECRET = process.env.JWT_SECRET || "kcca_internship_jwt_secret_fallback";
const JWT_EXPIRES = "7d";

// In-memory user store + file persistence
const userStore = new Map();

/** Load users from file system on boot */
const loadUserStore = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      for (const key in data) {
        userStore.set(key, data[key]);
      }
    }
  } catch (err) {
    console.error("[AUTH] Error loading userStore.json:", err.message);
  }
};

/** Persist users to file system */
const saveUserStore = () => {
  try {
    const obj = {};
    for (const [key, value] of userStore.entries()) {
      obj[key] = value;
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    console.error("[AUTH] Error saving userStore.json:", err.message);
  }
};

/** Seed default demo accounts if not already present */
const seedDemoUsers = () => {
  const defaultPasswordHash = bcrypt.hashSync("password123", 10);

  const demoAccounts = [
    {
      firstName: "Sarah",
      lastName: "Nakimuli",
      email: "applicant@kcca.go.ug",
      phone: "+256 701 234 567",
      role: "applicant",
      passwordHash: defaultPasswordHash,
      isVerified: true,
      createdAt: "2026-07-01T00:00:00.000Z",
    },
    {
      firstName: "James",
      lastName: "Ssemakula",
      email: "hr@kcca.go.ug",
      phone: "+256 703 456 789",
      role: "hr",
      passwordHash: defaultPasswordHash,
      isVerified: true,
      createdAt: "2025-01-15T00:00:00.000Z",
    },
    {
      firstName: "Patricia",
      lastName: "Nakato",
      email: "admin@kcca.go.ug",
      phone: "+256 704 789 012",
      role: "admin",
      passwordHash: defaultPasswordHash,
      isVerified: true,
      createdAt: "2024-06-01T00:00:00.000Z",
    },
  ];

  let added = false;
  for (const account of demoAccounts) {
    if (!userStore.has(account.email)) {
      userStore.set(account.email, account);
      added = true;
    }
  }
  if (added) {
    saveUserStore();
  }
};

// Initialize store & seed demo users
loadUserStore();
seedDemoUsers();

/** Generate a random 6-digit OTP */
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/** Strip sensitive fields before sending to client */
const safeUser = (u) => ({
  id: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
  name: `${u.firstName} ${u.lastName}`,
  email: u.email,
  phone: u.phone,
  role: u.role || "applicant",
  isVerified: u.isVerified,
  createdAt: u.createdAt,
});

/* ─────────────────────────────────────────────────────────────
   POST /api/auth/register
───────────────────────────────────────────────────────────── */
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: "All required fields must be provided." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = userStore.get(normalizedEmail);

    // Block re-registration of already-verified accounts
    if (existing && existing.isVerified) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please log in.",
      });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Persist to store (overwrite if previously unverified)
    userStore.set(normalizedEmail, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || "",
      passwordHash,
      role: "applicant",
      isVerified: false,
      otp: otpCode,
      otpExpiresAt,
      createdAt: existing?.createdAt || new Date().toISOString(),
    });

    saveUserStore();

    // Send verification email
    const emailResult = await sendVerificationEmail(normalizedEmail, otpCode, firstName.trim());

    const responsePayload = {
      success: true,
      message: "Registration successful! A 6-digit verification code has been sent to your email.",
      email: normalizedEmail,
      deliveryMode: emailResult.mode,
    };

    // In dev/console mode surface the code so the UI can display it as a toast
    if (emailResult.mode === "console" || emailResult.mode === "fallback") {
      responsePayload.devCode = emailResult.code || otpCode;
      responsePayload.message = `Registration successful! (Dev Mode — your verification code is: ${emailResult.code || otpCode})`;
    }

    return res.status(201).json(responsePayload);
  } catch (error) {
    console.error("[AUTH] Register failed:", error);
    return res.status(500).json({ success: false, message: "Internal server error during registration." });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /api/auth/verify-email
───────────────────────────────────────────────────────────── */
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Email and verification code are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = userStore.get(normalizedEmail);

    if (!user) {
      return res.status(404).json({ success: false, message: "Account not found. Please register first." });
    }

    if (user.isVerified) {
      return res.status(200).json({ success: true, message: "Email is already verified. You can sign in." });
    }

    if (user.otp !== code.trim()) {
      return res.status(400).json({ success: false, message: "Invalid verification code. Please check and try again." });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      return res.status(400).json({ success: false, message: "Verification code has expired. Please request a new one." });
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    user.verifiedAt = new Date().toISOString();
    userStore.set(normalizedEmail, user);
    saveUserStore();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in to your account.",
      user: safeUser(user),
    });
  } catch (error) {
    console.error("[AUTH] Verify email failed:", error);
    return res.status(500).json({ success: false, message: "Internal server error during email verification." });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /api/auth/resend-verification
───────────────────────────────────────────────────────────── */
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = userStore.get(normalizedEmail);

    if (!user) {
      return res.status(404).json({ success: false, message: "Account not found. Please register first." });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email is already verified. Please log in." });
    }

    const newOtp = generateOTP();
    user.otp = newOtp;
    user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    userStore.set(normalizedEmail, user);
    saveUserStore();

    const emailResult = await sendVerificationEmail(normalizedEmail, newOtp, user.firstName);

    const responsePayload = {
      success: true,
      message: "A new verification code has been sent to your email.",
      deliveryMode: emailResult.mode,
    };

    if (emailResult.mode === "console" || emailResult.mode === "fallback") {
      responsePayload.devCode = emailResult.code || newOtp;
      responsePayload.message = `New code sent! (Dev Mode — your new code is: ${emailResult.code || newOtp})`;
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error("[AUTH] Resend verification failed:", error);
    return res.status(500).json({ success: false, message: "Failed to resend verification code." });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /api/auth/login
───────────────────────────────────────────────────────────── */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = userStore.get(normalizedEmail);

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // Must verify email first
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Your email address is not yet verified. Please check your inbox for the verification code.",
        code: "EMAIL_NOT_VERIFIED",
        email: normalizedEmail,
      });
    }

    // Check password (supports bcrypt hash or plain text fallback for demo accounts)
    let passwordMatch = false;
    if (user.passwordHash) {
      passwordMatch = await bcrypt.compare(password, user.passwordHash);
    }
    if (!passwordMatch && user.password && user.password === password) {
      passwordMatch = true;
    }

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // Issue JWT
    const payload = safeUser(user);
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: payload,
    });
  } catch (error) {
    console.error("[AUTH] Login failed:", error);
    return res.status(500).json({ success: false, message: "Internal server error during login." });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  resendVerification,
  loginUser,
};
