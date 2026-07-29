// backend/src/controllers/authController.js
const { sendVerificationEmail } = require("../config/mailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getPool } = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "kcca_internship_jwt_secret_fallback";
const JWT_EXPIRES = "7d";
const SKIP_EMAIL_VERIFICATION = String(process.env.SKIP_EMAIL_VERIFICATION).toLowerCase() === "true";

const pool = getPool();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const safeUserRow = (u) => ({
  id: u.id,
  name: u.name,
  firstName: u.first_name || null,
  lastName: u.last_name || null,
  email: u.email,
  phone: u.phone,
  role: u.role,
  isVerified: u.is_verified,
  createdAt: u.created_at,
});

const ensureOtpColumns = async (client) => {
  await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(10)");
  await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP NULL");
};

const registerUser = async (req, res) => {
  const { firstName, lastName, email, phone, password, role } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ success: false, message: "All required fields must be provided." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const assignedRole = (role || "applicant").toLowerCase();
  const autoVerify = SKIP_EMAIL_VERIFICATION || assignedRole === "applicant";

  const client = await pool.connect();
  try {
    await ensureOtpColumns(client);

    const userRes = await client.query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);
    const existing = userRes.rows[0];

    if (existing && existing.is_verified) {
      client.release();
      return res.status(409).json({ success: false, message: "An account with this email already exists. Please log in." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const name = `${firstName.trim()} ${lastName.trim()}`;

    if (autoVerify) {
      const id = existing ? existing.id : `U${String(Date.now()).slice(-6)}`;
      if (existing) {
        await client.query(
          `UPDATE users SET name=$1, first_name=$2, last_name=$3, password_hash=$4, role=$5, phone=$6, is_verified=true, updated_at=NOW() WHERE email=$7`,
          [name, firstName.trim(), lastName.trim(), passwordHash, assignedRole, phone || null, normalizedEmail]
        );
      } else {
        await client.query(
          `INSERT INTO users (id, name, first_name, last_name, email, password_hash, role, phone, is_verified) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [id, name, firstName.trim(), lastName.trim(), normalizedEmail, passwordHash, assignedRole, phone || null, true]
        );
      }
      client.release();
      return res.status(201).json({ success: true, message: "Registration successful. Your account is verified and you can log in.", email: normalizedEmail, deliveryMode: "auto-verified" });
    }

    // OTP flow for non-applicant roles
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const id = existing ? existing.id : `U${String(Date.now()).slice(-6)}`;

    if (existing) {
      await client.query(
        `UPDATE users SET name=$1, first_name=$2, last_name=$3, password_hash=$4, role=$5, phone=$6, otp=$7, otp_expires_at=$8, updated_at=NOW() WHERE email=$9`,
        [name, firstName.trim(), lastName.trim(), passwordHash, assignedRole, phone || null, otpCode, otpExpiresAt, normalizedEmail]
      );
    } else {
      await client.query(
        `INSERT INTO users (id, name, first_name, last_name, email, password_hash, role, phone, is_verified, otp, otp_expires_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [id, name, firstName.trim(), lastName.trim(), normalizedEmail, passwordHash, assignedRole, phone || null, false, otpCode, otpExpiresAt]
      );
    }

    const emailResult = await sendVerificationEmail(normalizedEmail, otpCode, firstName.trim());
    client.release();

    const responsePayload = { success: true, message: "Registration successful! A 6-digit verification code has been sent to your email.", email: normalizedEmail, deliveryMode: emailResult.mode };
    if (emailResult.mode === "console" || emailResult.mode === "fallback") {
      responsePayload.devCode = emailResult.code || otpCode;
      responsePayload.message = `Registration successful! (Dev Mode — your verification code is: ${emailResult.code || otpCode})`;
    }
    return res.status(201).json(responsePayload);
  } catch (err) {
    client.release();
    console.error("[AUTH] Register failed:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error during registration." });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ success: false, message: "Email and verification code are required." });

    const normalizedEmail = String(email).trim().toLowerCase();
    const client = await pool.connect();
    await ensureOtpColumns(client);
    const userRes = await client.query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);
    const user = userRes.rows[0];
    if (!user) { client.release(); return res.status(404).json({ success: false, message: "Account not found. Please register first." }); }
    if (user.is_verified) { client.release(); return res.status(200).json({ success: true, message: "Email is already verified. You can sign in." }); }
    if (!user.otp || String(user.otp) !== String(code).trim()) { client.release(); return res.status(400).json({ success: false, message: "Invalid verification code. Please check and try again." }); }
    if (user.otp_expires_at && new Date() > new Date(user.otp_expires_at)) { client.release(); return res.status(400).json({ success: false, message: "Verification code has expired. Please request a new one." }); }

    await client.query("UPDATE users SET is_verified=true, otp=NULL, otp_expires_at=NULL, verified_at=NOW(), updated_at=NOW() WHERE email=$1", [normalizedEmail]);
    const updatedRes = await client.query("SELECT id, name, first_name, last_name, email, phone, role, is_verified, created_at FROM users WHERE email = $1", [normalizedEmail]);
    client.release();
    return res.status(200).json({ success: true, message: "Email verified successfully! You can now log in to your account.", user: updatedRes.rows[0] });
  } catch (err) {
    console.error("[AUTH] Verify email failed:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error during email verification." });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body; if (!email) return res.status(400).json({ success: false, message: "Email is required." });
    const normalizedEmail = String(email).trim().toLowerCase();
    const client = await pool.connect();
    await ensureOtpColumns(client);
    const userRes = await client.query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);
    const user = userRes.rows[0];
    if (!user) { client.release(); return res.status(404).json({ success: false, message: "Account not found. Please register first." }); }
    if (user.is_verified) { client.release(); return res.status(400).json({ success: false, message: "Email is already verified. Please log in." }); }
    const newOtp = generateOTP(); const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await client.query("UPDATE users SET otp=$1, otp_expires_at=$2, updated_at=NOW() WHERE email=$3", [newOtp, otpExpiresAt, normalizedEmail]);
    const emailResult = await sendVerificationEmail(normalizedEmail, newOtp, user.first_name || user.firstName || 'Applicant');
    client.release();
    const responsePayload = { success: true, message: "A new verification code has been sent to your email.", deliveryMode: emailResult.mode };
    if (emailResult.mode === "console" || emailResult.mode === "fallback") { responsePayload.devCode = emailResult.code || newOtp; responsePayload.message = `New code sent! (Dev Mode — your new code is: ${emailResult.code || newOtp})`; }
    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error("[AUTH] Resend verification failed:", err.message); return res.status(500).json({ success: false, message: "Failed to resend verification code." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body; if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required." });
    const normalizedEmail = String(email).trim().toLowerCase();
    const client = await pool.connect();
    const userRes = await client.query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);
    const user = userRes.rows[0];
    if (!user) { client.release(); return res.status(401).json({ success: false, message: "Invalid email or password." }); }
    if (!user.is_verified) { client.release(); return res.status(403).json({ success: false, message: "Your email address is not yet verified. Please check your inbox for the verification code.", code: "EMAIL_NOT_VERIFIED", email: normalizedEmail }); }
    let passwordMatch = false; if (user.password_hash) passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) { client.release(); return res.status(401).json({ success: false, message: "Invalid email or password." }); }
    const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    client.release();
    return res.status(200).json({ success: true, message: "Login successful.", token, user: payload });
  } catch (err) {
    console.error("[AUTH] Login failed:", err.message); return res.status(500).json({ success: false, message: "Internal server error during login." });
  }
};

module.exports = { registerUser, verifyEmail, resendVerification, loginUser };
