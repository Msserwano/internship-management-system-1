const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getPool } = require("../config/database");

const JWT_SECRET  = process.env.JWT_SECRET || "development-only-secret";
const JWT_EXPIRES = "7d";

// ---------------------------------------------------------------------------
// POST /api/auth/register (Applicant Registration)
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

  const client = await getPool().connect();
  try {
    // Check if applicant already exists
    const existing = (await client.query("SELECT applicant_id FROM applicants WHERE LOWER(email) = $1", [normalizedEmail])).rows[0];
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists. Please log in." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    await client.query(
      `INSERT INTO applicants (full_name, email, password_hash, phone_number)
       VALUES ($1, $2, $3, $4)`,
      [fullName, normalizedEmail, passwordHash, phone || null]
    );

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
// POST /api/auth/login (Staff & Applicants Login)
// ---------------------------------------------------------------------------
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const client = await getPool().connect();

  try {
    let user = null;
    let userType = null; // "staff_user" | "staff_legacy" | "applicant"

    // 1. Check operational `users` table (seeded staff: admin, hr, supervisor)
    const usersRes = await client.query("SELECT * FROM users WHERE LOWER(email) = $1", [normalizedEmail]);
    if (usersRes.rows[0]) {
      user = usersRes.rows[0];
      userType = "staff_user";
    }

    // 2. Fall back to legacy staff_users table
    if (!user) {
      const staffRes = await client.query("SELECT * FROM staff_users WHERE LOWER(email) = $1", [normalizedEmail]);
      if (staffRes.rows[0]) {
        user = staffRes.rows[0];
        userType = "staff_legacy";
      }
    }

    // 3. Fall back to applicants table
    if (!user) {
      const applicantRes = await client.query("SELECT * FROM applicants WHERE LOWER(email) = $1", [normalizedEmail]);
      if (applicantRes.rows[0]) {
        user = applicantRes.rows[0];
        userType = "applicant";
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // Deactivation check for staff
    if (userType === "staff_user" && user.status === "inactive") {
      return res.status(403).json({ success: false, message: "Your account is deactivated. Contact administrator." });
    }
    if (userType === "staff_legacy" && user.is_active === false) {
      return res.status(403).json({ success: false, message: "Your account is deactivated. Contact administrator." });
    }

    const passwordMatch = user.password_hash
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // Build frontend role
    let frontendRole = "applicant";
    let rawRole = "applicant";

    if (userType === "staff_user") {
      rawRole = user.role || "hr";
      if (rawRole === "admin") frontendRole = "admin";
      else frontendRole = "hr"; // hr, supervisor → all go to hr panel
    } else if (userType === "staff_legacy") {
      rawRole = user.role || "hr_officer";
      if (rawRole === "admin") frontendRole = "admin";
      else if (["director_hr", "manager_recruitment", "hr_officer", "pca_officer", "department_supervisor"].includes(rawRole)) frontendRole = "hr";
    }

    // Resolve user id and name across table shapes
    const userId = userType === "staff_user"
      ? user.id
      : userType === "staff_legacy"
        ? user.user_id
        : user.applicant_id;

    const userName = user.name || user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim();

    const payload = {
      id: userId,
      name: userName,
      email: user.email,
      role: frontendRole,
      rawRole,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: payload,
    });
  } catch (err) {
    console.error("[AUTH] Login failed:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error during login." });
  } finally {
    client.release();
  }
};

module.exports = { registerUser, loginUser };
