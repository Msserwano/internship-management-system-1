require("dotenv").config();
const { getPool } = require("../src/config/database");
const bcrypt = require("bcryptjs");

const createUser = async () => {
  const role = process.argv[2] || "admin";
  const email = process.argv[3] || `${role}@kcca.go.ug`;
  const password = process.argv[4] || "password123";
  const name = process.argv[5] || (role === "admin" ? "System Admin" : role === "hr" ? "HR Officer" : "Portal Applicant");

  try {
    const pool = getPool();
    const client = await pool.connect();

    const passwordHash = await bcrypt.hash(password, 10);
    const id = `U${String(Date.now()).slice(-6)}`;
    const [firstName, ...lastParts] = name.split(" ");
    const lastName = lastParts.join(" ") || "";

    await client.query(
      `INSERT INTO users (id, name, first_name, last_name, email, password_hash, role, status, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', true)
       ON CONFLICT (email) DO UPDATE SET password_hash = $6, role = $7, is_verified = true`,
      [id, name, firstName, lastName, email.toLowerCase().trim(), passwordHash, role]
    );

    client.release();
    console.log(`\n✅ Account created successfully!`);
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role:     ${role}\n`);
    await pool.end();
  } catch (err) {
    console.error("❌ Failed to create user:", err.message);
    process.exit(1);
  }
};

createUser();
