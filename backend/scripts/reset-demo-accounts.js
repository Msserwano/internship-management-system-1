require("dotenv").config();
const { getPool } = require("../src/config/database");
const bcrypt = require("bcryptjs");

const resetDefaultAccounts = async () => {
  try {
    const pool = getPool();
    const client = await pool.connect();
    const hash = await bcrypt.hash("password123", 10);

    const staffAccounts = [
      { name: "System Administrator", email: "admin@kcca.go.ug", role: "admin" },
      { name: "HR Officer",           email: "hr@kcca.go.ug",    role: "hr_officer" },
    ];

    const applicantAccounts = [
      { name: "Sarah Nakimuli", email: "applicant@kcca.go.ug" },
    ];

    for (const u of staffAccounts) {
      await client.query(
        `INSERT INTO staff_users (full_name, email, password_hash, role, is_active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (email) DO UPDATE SET password_hash = $3, role = $4, is_active = true`,
        [u.name, u.email.toLowerCase(), hash, u.role]
      );
    }

    for (const a of applicantAccounts) {
      await client.query(
        `INSERT INTO applicants (full_name, email, password_hash)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET password_hash = $3`,
        [a.name, a.email.toLowerCase(), hash]
      );
    }

    console.log("\n✅ Enterprise demo accounts seeded successfully:");
    console.log("   - ADMIN:     admin@kcca.go.ug     / password123");
    console.log("   - HR:        hr@kcca.go.ug        / password123");
    console.log("   - APPLICANT: applicant@kcca.go.ug / password123\n");

    client.release();
    await pool.end();
  } catch (err) {
    console.error("❌ Reset demo accounts failed:", err.message);
    process.exit(1);
  }
};

resetDefaultAccounts();
