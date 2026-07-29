// backend/src/config/database.js
/**
 * PostgreSQL Database Configuration
 * Manages connection pooling and database initialization
 */
const { Pool } = require("pg");
const logger = require("./logger");
const bcrypt = require("bcryptjs");

let pool = null;

/**
 * Initialize database connection pool
 */
const initializePool = () => {
  if (pool) return pool;

  // Prefer DATABASE_URL when available (e.g., in Heroku/CI). Fall back to individual env vars.
  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: parseInt(process.env.DB_MAX_CLIENTS, 10) || 20,
    });
    pool.on("error", (err) => {
      logger.error("Unexpected error on idle client", err);
    });
    return pool;
  }

  if (process.env.NODE_ENV === "production" && (!process.env.DB_HOST || !process.env.DB_PASSWORD || !process.env.DB_NAME)) {
    throw new Error("DB_HOST, DB_PASSWORD, and DB_NAME must be configured in production.");
  }

  const config = {
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    database: process.env.DB_NAME || "kcca_ims",
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: parseInt(process.env.DB_MAX_CLIENTS, 10) || 20,
  };

  pool = new Pool(config);

  pool.on("error", (err) => {
    logger.error("Unexpected error on idle client", err);
  });

  return pool;
};

/**
 * Get database connection
 */
const getPool = () => {
  if (!pool) {
    try {
      initializePool();
    } catch (err) {
      // If initialization fails, log and rethrow so callers can behave accordingly
      logger.error("Failed to initialize DB pool", { error: err.message });
      throw err;
    }
  }
  return pool;
};

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    const p = initializePool();
    const client = await p.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    logger.info("Database connected successfully", { timestamp: result.rows[0] });
    return true;
  } catch (err) {
    logger.error("Database connection failed", { error: err.message });
    return false;
  }
};

/**
 * Initialize database schema
 */
const initializeSchema = async () => {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('applicant', 'hr', 'admin', 'supervisor')),
        phone VARCHAR(30),
        gender VARCHAR(10),
        dob DATE,
        district VARCHAR(50),
        nationality VARCHAR(50) DEFAULT 'Ugandan',
        status VARCHAR(20) DEFAULT 'active',
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Internships table
    await client.query(`
      CREATE TABLE IF NOT EXISTS internships (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        department VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        vacancies INT DEFAULT 1,
        deadline DATE NOT NULL,
        supervisor VARCHAR(100),
        duration VARCHAR(50),
        location VARCHAR(100),
        status VARCHAR(20) DEFAULT 'open',
        posted_at DATE DEFAULT CURRENT_DATE,
        applicants_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id VARCHAR(50) PRIMARY KEY,
        internship_id VARCHAR(50) NOT NULL REFERENCES internships(id),
        applicant_id VARCHAR(50) NOT NULL REFERENCES users(id),
        university VARCHAR(150) NOT NULL,
        course VARCHAR(150) NOT NULL,
        gpa NUMERIC(3,2),
        status VARCHAR(30) DEFAULT 'submitted',
        review_note TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Interviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS interviews (
        id VARCHAR(50) PRIMARY KEY,
        application_id VARCHAR(50) NOT NULL REFERENCES applications(id),
        interview_date DATE NOT NULL,
        interview_time VARCHAR(20) NOT NULL,
        venue TEXT NOT NULL,
        meeting_link TEXT,
        status VARCHAR(20) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Audit logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        resource_id VARCHAR(50),
        old_value JSONB,
        new_value JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_applications_internship ON applications(internship_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id)`);

    await client.query("COMMIT");
    logger.info("Database schema initialized successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    logger.error("Failed to initialize database schema", { error: err.message });
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Seed demo users
 */
const seedDemoUsers = async () => {
  const client = await getPool().connect();

  try {
    const result = await client.query("SELECT COUNT(*) as count FROM users");

    if (result.rows[0].count > 0) {
      logger.info("Database already has users, skipping seed");
      return;
    }

    const passwordHash = await bcrypt.hash("password123", 10);

    const demoUsers = [
      {
        id: "U001",
        name: "Sarah Nakimuli",
        first_name: "Sarah",
        last_name: "Nakimuli",
        email: "applicant@kcca.go.ug",
        password_hash: passwordHash,
        role: "applicant",
        phone: "+256 701 234 567",
        gender: "Female",
        district: "Kampala",
        is_verified: true,
      },
      {
        id: "U002",
        name: "James Ssemakula",
        first_name: "James",
        last_name: "Ssemakula",
        email: "hr@kcca.go.ug",
        password_hash: passwordHash,
        role: "hr",
        phone: "+256 703 456 789",
        is_verified: true,
      },
      {
        id: "U003",
        name: "Patricia Nakato",
        first_name: "Patricia",
        last_name: "Nakato",
        email: "admin@kcca.go.ug",
        password_hash: passwordHash,
        role: "admin",
        phone: "+256 704 789 012",
        is_verified: true,
      },
    ];

    for (const user of demoUsers) {
      await client.query(
        `INSERT INTO users (id, name, first_name, last_name, email, password_hash, role, phone, gender, district, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          user.id,
          user.name,
          user.first_name,
          user.last_name,
          user.email,
          user.password_hash,
          user.role,
          user.phone,
          user.gender || null,
          user.district || "Kampala",
          user.is_verified,
        ]
      );
    }

    logger.info("Demo users seeded successfully");
  } catch (err) {
    logger.error("Failed to seed demo users", { error: err.message });
  } finally {
    client.release();
  }
};

/**
 * Close database connection
 */
const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info("Database pool closed");
  }
};

module.exports = {
  getPool,
  testConnection,
  initializeSchema,
  seedDemoUsers,
  closePool,
};
