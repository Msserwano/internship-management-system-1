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
    const ok = await db.delete(table, id);
    if (!ok) return res.status(404).json({ success: false, message: `${table.slice(0,-1)} not found` });
    return res.json({ success: true, message: `${table.slice(0,-1)} deleted`, id });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { list, getById, create, update, remove, ALLOWED_TABLES };
