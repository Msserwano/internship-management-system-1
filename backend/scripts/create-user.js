require("dotenv").config();
const { getPool } = require("../src/config/database");
const bcrypt = require("bcryptjs");

const createUser = async () => {
  const role = process.argv[2] || "admin";
  const email = process.argv[3] || `${role}@kcca.go.ug`;
  const password = process.argv[4] || "password123";
  const name = process.argv[5] || (role === "admin" ? "System Admin" : role.includes("hr") ? "HR Officer" : "Portal Applicant");

  try {
    const pool = getPool();
    const client = await pool.connect();
    const passwordHash = await bcrypt.hash(password, 10);
    const normalizedEmail = email.toLowerCase().trim();

    if (["admin", "director_hr", "manager_recruitment", "hr_officer", "pca_officer", "department_supervisor", "hr"].includes(role)) {
      const dbRole = role === "hr" ? "hr_officer" : role;
      await client.query(
        `INSERT INTO staff_users (full_name, email, password_hash, role, is_active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (email) DO UPDATE SET password_hash = $3, role = $4, is_active = true`,
        [name, normalizedEmail, passwordHash, dbRole]
      );
    } else {
      await client.query(
        `INSERT INTO applicants (full_name, email, password_hash)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET password_hash = $3`,
        [name, normalizedEmail, passwordHash]
      );
    }

    client.release();
    console.log(`\n✅ Enterprise account created successfully!`);
    console.log(`   Email:    ${normalizedEmail}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role:     ${role}\n`);
    await pool.end();
  } catch (err) {
    console.error("❌ Failed to create user:", err.message);
    process.exit(1);
  }
};

createUser();
