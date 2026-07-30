// backend/src/controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getPool } = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "development-only-secret";
const JWT_EXPIRES = "7d";

const pool = getPool();

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

const registerUser = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ success: false, message: "All required fields must be provided." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || String(password).length < 8) {
    return res.status(400).json({ success: false, message: "Provide a valid email address and a password of at least 8 characters." });
  }
  // Public registration can only create applicants. HR and administrator
  // accounts are provisioned through the administrator-only users endpoint.
  const assignedRole = "applicant";

  const client = await pool.connect();
  try {
    const userRes = await client.query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);
    const existing = userRes.rows[0];

    if (existing && existing.is_verified) {
      client.release();
      return res.status(409).json({ success: false, message: "An account with this email already exists. Please log in." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const name = `${firstName.trim()} ${lastName.trim()}`;

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
  } catch (err) {
    if (client) try { client.release(); } catch (e) {}
    console.error("[AUTH] Register failed:", err.message, err.stack);
    return res.status(500).json({ success: false, message: "Internal server error during registration." });
  }
};

// Email verification endpoints removed — verification is handled automatically via SKIP_EMAIL_VERIFICATION

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
    console.error("[AUTH] Login failed:", err.message, err.stack);
    return res.status(500).json({ success: false, message: "Internal server error during login." });
  }
};

module.exports = { registerUser, loginUser };
