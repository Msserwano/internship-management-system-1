const db = require('../config/db');

// Allowed tables for generic CRUD
const ALLOWED_TABLES = ['users', 'internships', 'applications', 'interviews', 'notifications'];

const ensureTable = (table) => {
  if (!ALLOWED_TABLES.includes(table)) throw new Error(`Table '${table}' is not allowed.`);
};

const list = async (req, res) => {
  try {
    const table = req.params.table;
    ensureTable(table);
    const q = req.query.q;
    let results;
    if (q) {
      const qLower = String(q).toLowerCase();
      results = await db.find(table, (item) => JSON.stringify(item).toLowerCase().includes(qLower));
    } else {
      results = await db.find(table);
    }
    return res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const table = req.params.table;
    const id = req.params.id;
    ensureTable(table);
    const item = await db.findById(table, id);
    if (!item) return res.status(404).json({ success: false, message: `${table.slice(0,-1)} not found` });
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const table = req.params.table;
    ensureTable(table);
    const payload = req.body;
    const created = await db.create(table, payload);
    return res.status(201).json({ success: true, message: `${table.slice(0,-1)} created`, data: created });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const table = req.params.table;
    const id = req.params.id;
    ensureTable(table);
    const updates = req.body;
    const updated = await db.update(table, id, updates);
    if (!updated) return res.status(404).json({ success: false, message: `${table.slice(0,-1)} not found` });
    return res.json({ success: true, message: `${table.slice(0,-1)} updated`, data: updated });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const table = req.params.table;
    const id = req.params.id;
    ensureTable(table);
    const actor = req.user ? { id: req.user.id, role: req.user.role } : null;
    const reason = req.body && req.body.reason ? req.body.reason : req.query && req.query.reason ? req.query.reason : null;
    // Admins can request a hard delete with ?hard=true
    const hardRequested = req.query && (req.query.hard === 'true' || req.query.hard === '1');
    const isAdmin = actor && String(actor.role).toLowerCase() === 'admin';
    const opts = { soft: !(isAdmin && hardRequested), actor, reason };
    // Perform delete (soft by default, hard if admin requested)
    const ok = await db.delete(table, id, opts);
    if (!ok) return res.status(404).json({ success: false, message: `${table.slice(0,-1)} not found` });
    return res.json({ success: true, message: `${table.slice(0,-1)} deleted`, id });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { list, getById, create, update, remove, ALLOWED_TABLES };
