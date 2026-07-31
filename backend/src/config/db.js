
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
  users: [],
  internships: [],
  applications: [],
  interviews: [],
  auditLogs: [],
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
