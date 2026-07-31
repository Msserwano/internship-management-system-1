
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET  = process.env.JWT_SECRET || "development-only-secret";
const JWT_EXPIRES = "7d";

// Safe representation of a user row to send in JWT payload / responses
const safeUserRow = (u) => ({
  id:         u.id,
  name:       u.name,
  firstName:  u.first_name  || null,
  lastName:   u.last_name   || null,
  email:      u.email,
  phone:      u.phone,
  role:       u.role,
  isVerified: u.is_verified,
  createdAt:  u.created_at,
});

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
const registerUser = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ success: false, message: "All required fields must be provided." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || String(password).length < 8) {
    return res.status(400).json({
      success: false,
      message: "Provide a valid email address and a password of at least 8 characters.",
    });
  }

  // Pool is fetched lazily here — no module-load crash risk
  const { getPool } = require("../config/database");
  const client = await getPool().connect();
  try {
    const existing = (await client.query("SELECT * FROM users WHERE email = $1", [normalizedEmail])).rows[0];

    if (existing && existing.is_verified) {
      return res.status(409).json({ success: false, message: "An account with this email already exists. Please log in." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const name = `${firstName.trim()} ${lastName.trim()}`;
    const id   = existing ? existing.id : `U${String(Date.now()).slice(-6)}`;

    if (existing) {
      await client.query(
        `UPDATE users SET name=$1, first_name=$2, last_name=$3, password_hash=$4, role=$5, phone=$6, is_verified=true, updated_at=NOW() WHERE email=$7`,
        [name, firstName.trim(), lastName.trim(), passwordHash, "applicant", phone || null, normalizedEmail]
      );
    } else {
      await client.query(
        `INSERT INTO users (id, name, first_name, last_name, email, password_hash, role, phone, is_verified)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [id, name, firstName.trim(), lastName.trim(), normalizedEmail, passwordHash, "applicant", phone || null, true]
      );
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful. You can now log in.",
      email: normalizedEmail,
    });
  } catch (err) {
    console.error("[AUTH] Register failed:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error during registration." });
  } finally {
    client.release();
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const { getPool } = require("../config/database");
  const client = await getPool().connect();
  try {
    const user = (await client.query("SELECT * FROM users WHERE email = $1", [normalizedEmail])).rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Your email address is not yet verified. Please contact the administrator.",
        code: "EMAIL_NOT_VERIFIED",
        email: normalizedEmail,
      });
    }

    if (user.status && user.status !== "active") {
      return res.status(403).json({ success: false, message: "Your account has been suspended. Contact the administrator." });
    }

    const passwordMatch = user.password_hash
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token   = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return res.status(200).json({ success: true, message: "Login successful.", token, user: payload });
  } catch (err) {
    console.error("[AUTH] Login failed:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error during login." });
  } finally {
    client.release();
  }
};

module.exports = { registerUser, loginUser };
