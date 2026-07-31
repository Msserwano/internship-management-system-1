const { getPool } = require('../config/database');

const ALLOWED_TABLES = ['users', 'internships', 'applications', 'interviews', 'notifications', 'departments', 'audit_logs'];

// Primary key column per table
const PK = {
  users: 'id',
  internships: 'id',
  applications: 'id',
  interviews: 'id',
  notifications: 'id',
  departments: 'department_id',
  audit_logs: 'id',
};

const ensureTable = (table) => {
  if (!ALLOWED_TABLES.includes(table)) throw new Error(`Table '${table}' is not allowed.`);
};

// GET /api/data/:table  — list all rows (with optional ?q= text search)
const list = async (req, res) => {
  try {
    const table = req.params.table;
    ensureTable(table);
    const pool = getPool();
    const q = req.query.q;
    let result;
    if (q) {
      // Search via ILIKE across the row cast to text
      result = await pool.query(`SELECT * FROM ${table} WHERE CAST(${table} AS TEXT) ILIKE $1 ORDER BY 1 DESC`, [`%${q}%`]);
    } else {
      result = await pool.query(`SELECT * FROM ${table} ORDER BY 1 DESC`);
    }
    return res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('[GENERIC] list error:', err.message);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/data/:table/:id
const getById = async (req, res) => {
  try {
    const { table, id } = req.params;
    ensureTable(table);
    const pool = getPool();
    const pk = PK[table] || 'id';
    const result = await pool.query(`SELECT * FROM ${table} WHERE ${pk}::text = $1`, [id]);
    const item = result.rows[0];
    if (!item) return res.status(404).json({ success: false, message: `${table.slice(0, -1)} not found` });
    return res.json({ success: true, data: item });
  } catch (err) {
    console.error('[GENERIC] getById error:', err.message);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/data/:table
const create = async (req, res) => {
  try {
    const { table } = req.params;
    ensureTable(table);
    const pool = getPool();
    const payload = req.body;
    const keys = Object.keys(payload);
    if (keys.length === 0) return res.status(400).json({ success: false, message: 'No fields provided.' });

    const cols = keys.join(', ');
    const vals = keys.map((_, i) => `$${i + 1}`).join(', ');
    const values = keys.map(k => payload[k]);

    const result = await pool.query(
      `INSERT INTO ${table} (${cols}) VALUES (${vals}) RETURNING *`,
      values
    );
    return res.status(201).json({ success: true, message: `${table.slice(0, -1)} created`, data: result.rows[0] });
  } catch (err) {
    console.error('[GENERIC] create error:', err.message);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/data/:table/:id
const update = async (req, res) => {
  try {
    const { table, id } = req.params;
    ensureTable(table);
    const pool = getPool();
    const pk = PK[table] || 'id';
    const updates = req.body;
    const keys = Object.keys(updates);
    if (keys.length === 0) return res.status(400).json({ success: false, message: 'No fields to update.' });

    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = keys.map(k => updates[k]);
    values.push(id);

    const result = await pool.query(
      `UPDATE ${table} SET ${sets} WHERE ${pk}::text = $${values.length} RETURNING *`,
      values
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: `${table.slice(0, -1)} not found` });
    return res.json({ success: true, message: `${table.slice(0, -1)} updated`, data: result.rows[0] });
  } catch (err) {
    console.error('[GENERIC] update error:', err.message);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/data/:table/:id
const remove = async (req, res) => {
  try {
    const { table, id } = req.params;
    ensureTable(table);
    const pool = getPool();
    const pk = PK[table] || 'id';

    const result = await pool.query(
      `DELETE FROM ${table} WHERE ${pk}::text = $1 RETURNING ${pk}`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: `${table.slice(0, -1)} not found` });
    return res.json({ success: true, message: `${table.slice(0, -1)} deleted`, id: result.rows[0][pk] });
  } catch (err) {
    console.error('[GENERIC] delete error:', err.message);
    return res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { list, getById, create, update, remove, ALLOWED_TABLES };
