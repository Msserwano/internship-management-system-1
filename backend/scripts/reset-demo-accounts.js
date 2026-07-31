require("dotenv").config();
const { getPool } = require("../src/config/database");
const bcrypt = require("bcryptjs");

const resetDefaultPasswords = async () => {
  try {
    const pool = getPool();
    const client = await pool.connect();
    const hash = await bcrypt.hash("password123", 10);

    const demoUsers = [
      { id: "U001", name: "System Administrator", email: "admin@kcca.go.ug", role: "admin" },
      { id: "U002", name: "HR Officer",           email: "hr@kcca.go.ug",    role: "hr" },
      { id: "U003", name: "Sarah Nakimuli",       email: "applicant@kcca.go.ug", role: "applicant" },
    ];

    for (const u of demoUsers) {
      const [firstName, ...lastParts] = u.name.split(" ");
      const lastName = lastParts.join(" ") || "";
      await client.query(
        `INSERT INTO users (id, name, first_name, last_name, email, password_hash, role, status, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', true)
         ON CONFLICT (email) DO UPDATE 
         SET password_hash = $6, role = $7, status = 'active', is_verified = true`,
        [u.id, u.name, firstName, lastName, u.email, hash, u.role]
      );
    }

    const res = await client.query("SELECT id, name, email, role, is_verified, status FROM users");
    console.log("\n✅ Demo accounts created / updated cleanly:");
    for (const r of res.rows) {
      const match = await bcrypt.compare("password123", hash);
      console.log(`   - ${r.role.toUpperCase()}: ${r.email} / password123 (Verified: ${r.is_verified}, Status: ${r.status}) [Password Match: ${match}]`);
    }

    client.release();
    await pool.end();
  } catch (err) {
    console.error("❌ Reset failed:", err.message);
    process.exit(1);
  }
};

resetDefaultPasswords();
