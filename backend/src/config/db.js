
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/dbStore.json");
const DATA_DIR  = path.join(__dirname, "../data");


if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}


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


const INITIAL_DB = {
  users: [
    { id: "U001", name: "Sarah Nakimuli", firstName: "Sarah", lastName: "Nakimuli", email: "applicant@kcca.go.ug", password: "password123", role: "applicant", phone: "+256 701 234 567", gender: "Female", district: "Kampala", nationality: "Ugandan", status: "active", createdAt: "2026-07-01T00:00:00.000Z", isVerified: true },
    { id: "U002", name: "James Ssemakula", firstName: "James", lastName: "Ssemakula", email: "hr@kcca.go.ug", password: "password123", role: "hr", phone: "+256 703 456 789", title: "HR Officer", status: "active", createdAt: "2025-01-15T00:00:00.000Z", isVerified: true },
    { id: "U003", name: "Patricia Nakato", firstName: "Patricia", lastName: "Nakato", email: "admin@kcca.go.ug", password: "password123", role: "admin", phone: "+256 704 789 012", title: "System Administrator", status: "active", createdAt: "2024-06-01T00:00:00.000Z", isVerified: true },
    { id: "U004", name: "Alex Ssebaggala", firstName: "Alex", lastName: "Ssebaggala", email: "alex.ssebaggala@gmail.com", password: "password123", role: "applicant", phone: "+256 702 111 222", gender: "Male", district: "Wakiso", isVerified: true },
    { id: "U005", name: "Brenda Atuhaire", firstName: "Brenda", lastName: "Atuhaire", email: "brenda.atuhaire@gmail.com", password: "password123", role: "applicant", phone: "+256 705 333 444", gender: "Female", district: "Mukono", isVerified: true },
    { id: "U006", name: "David Ochieng", firstName: "David", lastName: "Ochieng", email: "david.ochieng@gmail.com", password: "password123", role: "applicant", phone: "+256 706 555 666", gender: "Male", district: "Jinja", isVerified: true },
    { id: "U007", name: "Joan Nanteza", firstName: "Joan", lastName: "Nanteza", email: "joan.nanteza@gmail.com", password: "password123", role: "applicant", phone: "+256 707 777 888", gender: "Female", district: "Kampala", isVerified: true },
    { id: "U008", name: "Emmanuel Kato", firstName: "Emmanuel", lastName: "Kato", email: "emmanuel.kato@gmail.com", password: "password123", role: "applicant", phone: "+256 708 999 000", gender: "Male", district: "Masaka", isVerified: true },
  ],
  internships: [
    { id: "INT001", title: "Software Development Intern", department: "ICT", description: "Develop and maintain internal web apps and databases.", vacancies: 4, deadline: "2026-08-15", supervisor: "Mr. Peter Mwesigwa", duration: "3 Months", location: "City Hall – Kampala", status: "open", posted: "2026-07-01", applicantsCount: 23 },
    { id: "INT002", title: "Public Health Intern", department: "Public Health Services", description: "Community health outreach programs and data collection.", vacancies: 6, deadline: "2026-08-20", supervisor: "Dr. Aisha Namazzi", duration: "6 Months", location: "Kawempe Division", status: "open", posted: "2026-07-05", applicantsCount: 41 },
    { id: "INT003", title: "Urban Planning Intern", department: "Urban Planning", description: "Support land-use mapping and environmental impact assessments.", vacancies: 3, deadline: "2026-08-30", supervisor: "Eng. Moses Kabugo", duration: "4 Months", location: "City Hall – Kampala", status: "open", posted: "2026-07-08", applicantsCount: 15 },
    { id: "INT004", title: "Finance & Accounts Intern", department: "Finance & Planning", description: "Assist in financial reporting, budget prep, and audit support.", vacancies: 5, deadline: "2026-09-01", supervisor: "Ms. Grace Akullo", duration: "3 Months", location: "City Hall – Kampala", status: "open", posted: "2026-07-10", applicantsCount: 37 },
  ],
  applications: [
    { id: "APP001", internshipId: "INT001", internshipTitle: "Software Development Intern", department: "ICT", applicantId: "U001", applicantName: "Sarah Nakimuli", university: "Makerere University", course: "Computer Science", gender: "Female", gpa: "4.5", status: "shortlisted", submittedAt: "2026-07-10T09:30:00Z", reviewNote: "Exceptional academic background and strong coding skills.", assignedHrName: "James Ssemakula" },
    { id: "APP002", internshipId: "INT004", internshipTitle: "Finance & Accounts Intern", department: "Finance & Planning", applicantId: "U005", applicantName: "Brenda Atuhaire", university: "Uganda Christian University", course: "Accounting & Finance", gender: "Female", gpa: "4.2", status: "under_review", submittedAt: "2026-07-15T11:00:00Z", reviewNote: "Documents verified. Pending HR department manager endorsement.", assignedHrName: "James Ssemakula" },
    { id: "APP003", internshipId: "INT002", internshipTitle: "Public Health Intern", department: "Public Health Services", applicantId: "U006", applicantName: "David Ochieng", university: "MUST", course: "Public Health", gender: "Male", gpa: "4.1", status: "shortlisted", submittedAt: "2026-07-18T14:20:00Z", reviewNote: "Strong community outreach background and research experience.", assignedHrName: "James Ssemakula" },
    { id: "APP004", internshipId: "INT003", internshipTitle: "Urban Planning Intern", department: "Urban Planning", applicantId: "U008", applicantName: "Emmanuel Kato", university: "Makerere University", course: "Urban Planning & Environment", gender: "Male", gpa: "3.9", status: "submitted", submittedAt: "2026-07-20T08:45:00Z", reviewNote: "Application received and queued for initial screening.", assignedHrName: null },
    { id: "APP005", internshipId: "INT001", internshipTitle: "Software Development Intern", department: "ICT", applicantId: "U004", applicantName: "Alex Ssebaggala", university: "Kyambogo University", course: "Information Technology", gender: "Male", gpa: "4.3", status: "interview", submittedAt: "2026-07-21T10:15:00Z", reviewNote: "Invited for technical interview.", assignedHrName: "James Ssemakula" },
    { id: "APP006", internshipId: "INT002", internshipTitle: "Public Health Intern", department: "Public Health Services", applicantId: "U007", applicantName: "Joan Nanteza", university: "MUBS", course: "Business Administration", gender: "Female", gpa: "3.7", status: "accepted", submittedAt: "2026-07-22T16:00:00Z", reviewNote: "Approved for placement in Kawempe Division outreach team.", assignedHrName: "James Ssemakula" }
  ],
  interviews: [
    { id: "IVW001", applicationId: "APP001", applicantName: "Sarah Nakimuli", internshipTitle: "Software Development Intern", department: "ICT", date: "2026-08-05", time: "10:00 AM", venue: "KCCA Boardroom 2, City Hall", meetingLink: "https://meet.google.com/kcca-int-2026", status: "scheduled" },
  ]
  ,

  auditLogs: []
};


let dbStore = { ...INITIAL_DB };

const loadDbStore = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

      dbStore = { ...INITIAL_DB, ...data };
      if (!dbStore.auditLogs) dbStore.auditLogs = [];
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


const db = {

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


  async find(table, filterFn = null) {
    const list = dbStore[table] || [];

    const active = list.filter((item) => !item || item.deleted !== true);
    if (!filterFn) return [...active];
    return active.filter(filterFn);
  },


  async findById(table, id) {
    const list = dbStore[table] || [];
    const item = list.find((item) => String(item.id) === String(id)) || null;
    if (!item) return null;
    if (item.deleted) return null;
    return item;
  },


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


  async appendAuditLog(entry) {
    if (!dbStore.auditLogs) dbStore.auditLogs = [];
    const log = { id: `LOG${Date.now()}`, timestamp: new Date().toISOString(), ...entry };
    dbStore.auditLogs.unshift(log);
    saveDbStore();
    return log;
  },



  async getAuditLogs(filter = {}, options = {}) {
    const logs = dbStore.auditLogs || [];
    const filtered = logs.filter((l) => {
      if (filter.table && String(l.table) !== String(filter.table)) return false;
      if (filter.id && String(l.id) !== String(filter.id)) return false;
      if (filter.action && String(l.action) !== String(filter.action)) return false;
      return true;
    });
    const total = filtered.length;
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Number(options.limit) || total);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);
    return { total, page, limit, data };
  },


  async purgeDeleted(table) {
    const list = dbStore[table] || [];
    const toRemove = list.filter((it) => it && it.deleted === true);
    if (toRemove.length === 0) return { removed: 0 };

    dbStore[table] = list.filter((it) => !(it && it.deleted === true));

    for (const it of toRemove) {
      await this.appendAuditLog({ action: 'purge', table, id: it.id, removed: it });
    }
    saveDbStore();
    return { removed: toRemove.length };
  },


  async delete(table, id, opts = { soft: true, actor: null, reason: null }) {
    const list = dbStore[table] || [];
    const idx = list.findIndex((item) => String(item.id) === String(id));
    if (idx === -1) return false;

    const actor = opts.actor || null;
    const reason = opts.reason || null;

    if (opts.soft) {

      list[idx] = {
        ...list[idx],
        deleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: actor,
        deleteReason: reason,
      };
      saveDbStore();
      await this.appendAuditLog({ action: 'soft-delete', table, id, actor, reason });
      return true;
    }


    const removed = list.splice(idx, 1);
    saveDbStore();
    await this.appendAuditLog({ action: 'delete', table, id, actor, reason, removed: removed[0] });
    return true;
  }
};

module.exports = db;
