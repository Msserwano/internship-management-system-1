

const { Pool } = require("pg");
const logger = require("./logger");
const bcrypt = require("bcryptjs");

let pool = null;


const initializePool = () => {
  if (pool) return pool;

  if (process.env.DATABASE_URL) {
    const config = {
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: parseInt(process.env.DB_MAX_CLIENTS, 10) || 20,
    };

    if (process.env.DB_SSL === "true") {
      config.ssl = { rejectUnauthorized: false };
    }

    pool = new Pool(config);
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

  if (process.env.DB_SSL === "true") {
    config.ssl = { rejectUnauthorized: false };
  }

  pool = new Pool(config);

  pool.on("error", (err) => {
    logger.error("Unexpected error on idle client", err);
  });

  return pool;
};


const getPool = () => {
  if (!pool) {
    try {
      initializePool();
    } catch (err) {

      logger.error("Failed to initialize DB pool", { error: err.message });
      throw err;
    }
  }
  return pool;
};


const testConnection = async () => {
  try {
    const p = initializePool();
    const client = await p.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    logger.info("Database connected successfully", { timestamp: result.rows[0] });
    return true;
  } catch (err) {
    logger.error("Database connection failed", {
      error: err.message || err.code || "Unable to establish a PostgreSQL connection",
      host: process.env.DB_HOST || "DATABASE_URL",
    });
    return false;
  }
};


const initializeSchema = async () => {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");


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


const seedDemoUsers = async () => {
  const client = await getPool().connect();

  try {
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

    const additionalApplicants = [
      { id: "U004", name: "Alex Ssebaggala", first_name: "Alex", last_name: "Ssebaggala", email: "alex.ssebaggala@gmail.com", password_hash: passwordHash, role: "applicant", phone: "+256 702 111 222", gender: "Male", district: "Wakiso", is_verified: true },
      { id: "U005", name: "Brenda Atuhaire", first_name: "Brenda", last_name: "Atuhaire", email: "brenda.atuhaire@gmail.com", password_hash: passwordHash, role: "applicant", phone: "+256 705 333 444", gender: "Female", district: "Mukono", is_verified: true },
      { id: "U006", name: "David Ochieng", first_name: "David", last_name: "Ochieng", email: "david.ochieng@gmail.com", password_hash: passwordHash, role: "applicant", phone: "+256 706 555 666", gender: "Male", district: "Jinja", is_verified: true },
      { id: "U007", name: "Joan Nanteza", first_name: "Joan", last_name: "Nanteza", email: "joan.nanteza@gmail.com", password_hash: passwordHash, role: "applicant", phone: "+256 707 777 888", gender: "Female", district: "Kampala", is_verified: true },
      { id: "U008", name: "Emmanuel Kato", first_name: "Emmanuel", last_name: "Kato", email: "emmanuel.kato@gmail.com", password_hash: passwordHash, role: "applicant", phone: "+256 708 999 000", gender: "Male", district: "Masaka", is_verified: true },
    ];

    for (const user of [...demoUsers, ...additionalApplicants]) {
      await client.query(
        `INSERT INTO users (id, name, first_name, last_name, email, password_hash, role, phone, gender, district, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (email) DO NOTHING`,
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


    const demoInternships = [
      { id: "INT001", title: "Software Development Intern", department: "ICT", description: "Develop internal software systems and web portals for KCCA.", vacancies: 4, deadline: "2026-08-15", supervisor: "Mr. Peter Mwesigwa", duration: "3 Months", location: "City Hall – Kampala", status: "open" },
      { id: "INT002", title: "Public Health Intern", department: "Public Health Services", description: "Community health outreach programs and data collection.", vacancies: 6, deadline: "2026-08-20", supervisor: "Dr. Aisha Namazzi", duration: "6 Months", location: "Kawempe Division", status: "open" },
      { id: "INT003", title: "Urban Planning Intern", department: "Urban Planning", description: "Support land-use mapping and environmental impact assessments.", vacancies: 3, deadline: "2026-08-30", supervisor: "Eng. Moses Kabugo", duration: "4 Months", location: "City Hall – Kampala", status: "open" },
      { id: "INT004", title: "Finance & Accounts Intern", department: "Finance & Planning", description: "Assist in financial reporting, budget prep, and audit support.", vacancies: 5, deadline: "2026-09-01", supervisor: "Ms. Grace Akullo", duration: "3 Months", location: "City Hall – Kampala", status: "open" }
    ];

    for (const item of demoInternships) {
      await client.query(
        `INSERT INTO internships (id, title, department, description, vacancies, deadline, supervisor, duration, location, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [item.id, item.title, item.department, item.description, item.vacancies, item.deadline, item.supervisor, item.duration, item.location, item.status]
      );
    }


    const demoApplications = [
      { id: "APP001", internship_id: "INT001", applicant_id: "U001", university: "Makerere University", course: "Computer Science", gpa: 4.5, status: "shortlisted", review_note: "Exceptional academic background and strong coding skills.", assigned_hr_id: "U002", submitted_at: "2026-07-10T09:30:00Z" },
      { id: "APP002", internship_id: "INT004", applicant_id: "U005", university: "Uganda Christian University", course: "Accounting & Finance", gpa: 4.2, status: "under_review", review_note: "Documents verified. Pending HR department manager endorsement.", assigned_hr_id: "U002", submitted_at: "2026-07-15T11:00:00Z" },
      { id: "APP003", internship_id: "INT002", applicant_id: "U006", university: "MUST", course: "Public Health", gpa: 4.1, status: "shortlisted", review_note: "Strong community outreach background and research experience.", assigned_hr_id: "U002", submitted_at: "2026-07-18T14:20:00Z" },
      { id: "APP004", internship_id: "INT003", applicant_id: "U008", university: "Makerere University", course: "Urban Planning & Environment", gpa: 3.9, status: "submitted", review_note: "Application received and queued for initial screening.", assigned_hr_id: null, submitted_at: "2026-07-20T08:45:00Z" },
      { id: "APP005", internship_id: "INT001", applicant_id: "U004", university: "Kyambogo University", course: "Information Technology", gpa: 4.3, status: "interview", review_note: "Invited for technical interview.", assigned_hr_id: "U002", submitted_at: "2026-07-21T10:15:00Z" },
      { id: "APP006", internship_id: "INT002", applicant_id: "U007", university: "MUBS", course: "Business Administration", gpa: 3.7, status: "accepted", review_note: "Approved for placement in Kawempe Division outreach team.", assigned_hr_id: "U002", submitted_at: "2026-07-22T16:00:00Z" },
    ];

    for (const app of demoApplications) {
      await client.query(
        `INSERT INTO applications (id, internship_id, applicant_id, university, course, gpa, status, review_note, assigned_hr_id, submitted_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [app.id, app.internship_id, app.applicant_id, app.university, app.course, app.gpa, app.status, app.review_note, app.assigned_hr_id, app.submitted_at]
      );
    }

    logger.info("Demo users, internships, and HR applications seeded successfully");
  } catch (err) {
    logger.error("Failed to seed demo data", { error: err.message });
  } finally {
    client.release();
  }
};


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
