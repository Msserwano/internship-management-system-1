// backend/src/config/db.js
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/dbStore.json");
const DATA_DIR  = path.join(__dirname, "../data");

// Create data directory if missing
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// PostgreSQL connection pool configuration
let pool = null;
let pgConnected = false;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 2000,
    });
  } catch (err) {
    console.warn("[DB] PostgreSQL pool creation notice:", err.message);
  }
}

// Initial seed tables & records
const INITIAL_DB = {
  users: [
    { id: "U001", name: "Sarah Nakimuli", firstName: "Sarah", lastName: "Nakimuli", email: "applicant@kcca.go.ug", password: "password123", role: "applicant", phone: "+256 701 234 567", gender: "Female", district: "Kampala", nationality: "Ugandan", status: "active", createdAt: "2026-07-01T00:00:00.000Z", isVerified: true },
    { id: "U002", name: "James Ssemakula", firstName: "James", lastName: "Ssemakula", email: "hr@kcca.go.ug", password: "password123", role: "hr", phone: "+256 703 456 789", title: "HR Officer", status: "active", createdAt: "2025-01-15T00:00:00.000Z", isVerified: true },
    { id: "U003", name: "Patricia Nakato", firstName: "Patricia", lastName: "Nakato", email: "admin@kcca.go.ug", password: "password123", role: "admin", phone: "+256 704 789 012", title: "System Administrator", status: "active", createdAt: "2024-06-01T00:00:00.000Z", isVerified: true },
  ],
  internships: [
    { id: "INT001", title: "Software Development Intern", department: "ICT", description: "Develop and maintain internal web apps and databases.", vacancies: 4, deadline: "2026-08-15", supervisor: "Mr. Peter Mwesigwa", duration: "3 Months", location: "City Hall – Kampala", status: "open", posted: "2026-07-01", applicantsCount: 23 },
    { id: "INT002", title: "Public Health Intern", department: "Public Health Services", description: "Community health outreach programs and data collection.", vacancies: 6, deadline: "2026-08-20", supervisor: "Dr. Aisha Namazzi", duration: "6 Months", location: "Kawempe Division", status: "open", posted: "2026-07-05", applicantsCount: 41 },
    { id: "INT003", title: "Urban Planning Intern", department: "Urban Planning", description: "Support land-use mapping and environmental impact assessments.", vacancies: 3, deadline: "2026-08-30", supervisor: "Eng. Moses Kabugo", duration: "4 Months", location: "City Hall – Kampala", status: "open", posted: "2026-07-08", applicantsCount: 15 },
    { id: "INT004", title: "Finance & Accounts Intern", department: "Finance & Planning", description: "Assist in financial reporting, budget prep, and audit support.", vacancies: 5, deadline: "2026-09-01", supervisor: "Ms. Grace Akullo", duration: "3 Months", location: "City Hall – Kampala", status: "open", posted: "2026-07-10", applicantsCount: 37 },
  ],
  applications: [
    { id: "APP001", internshipId: "INT001", internshipTitle: "Software Development Intern", department: "ICT", applicantId: "U001", applicantName: "Sarah Nakimuli", university: "Makerere University", course: "Computer Science", gender: "Female", gpa: "4.2", status: "shortlisted", submittedAt: "2026-07-10T09:30:00Z", reviewNote: "Shortlisted for interview." },
    { id: "APP002", internshipId: "INT004", internshipTitle: "Finance & Accounts Intern", department: "Finance & Planning", applicantId: "U001", applicantName: "Sarah Nakimuli", university: "Makerere University", course: "Computer Science", gender: "Female", gpa: "4.2", status: "under_review", submittedAt: "2026-07-15T11:00:00Z", reviewNote: "" },
  ],
  interviews: [
    { id: "IVW001", applicationId: "APP001", applicantName: "Sarah Nakimuli", internshipTitle: "Software Development Intern", department: "ICT", date: "2026-08-05", time: "10:00 AM", venue: "KCCA Boardroom 2, City Hall", meetingLink: "https://meet.google.com/kcca-int-2026", status: "scheduled" },
  ]
};

// Memory store initialized from disk or default seed
let dbStore = { ...INITIAL_DB };

const loadDbStore = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      dbStore = { ...INITIAL_DB, ...data };
    } else {
      saveDbStore();
    }
  } catch (err) {
    console.error("[DB] Error loading dbStore.json:", err.message);
  }
};

const saveDbStore = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dbStore, null, 2), "utf-8");
  } catch (err) {
    console.error("[DB] Error saving dbStore.json:", err.message);
  }
};

loadDbStore();

/**
 * Generic CRUD helper methods
 */
const db = {
  // Check health / mode
  async isPostgresActive() {
    if (!pool) return false;
    try {
      const client = await pool.connect();
      client.release();
      return true;
    } catch {
      return false;
    }
  },

  // ── RETRIEVE (FIND ALL / FILTER) ──────────────────────────────────────────
  async find(table, filterFn = null) {
    const list = dbStore[table] || [];
    if (!filterFn) return [...list];
    return list.filter(filterFn);
  },

  // ── RETRIEVE BY ID ────────────────────────────────────────────────────────
  async findById(table, id) {
    const list = dbStore[table] || [];
    return list.find((item) => String(item.id) === String(id)) || null;
  },

  // ── WRITE / STORE (CREATE) ────────────────────────────────────────────────
  async create(table, record) {
    if (!dbStore[table]) dbStore[table] = [];
    const newRecord = {
      id: record.id || `${table.toUpperCase().slice(0,3)}${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...record,
    };
    dbStore[table].unshift(newRecord);
    saveDbStore();
    return newRecord;
  },

  // ── EDIT / MODIFY (UPDATE) ────────────────────────────────────────────────
  async update(table, id, updates) {
    const list = dbStore[table] || [];
    const idx = list.findIndex((item) => String(item.id) === String(id));
    if (idx === -1) return null;

    const updated = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[idx] = updated;
    saveDbStore();
    return updated;
  },

  // ── DELETE ────────────────────────────────────────────────────────────────
  async delete(table, id) {
    const list = dbStore[table] || [];
    const idx = list.findIndex((item) => String(item.id) === String(id));
    if (idx === -1) return false;

    dbStore[table].splice(idx, 1);
    saveDbStore();
    return true;
  }
};

module.exports = db;
