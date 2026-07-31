
const { getPool } = require("../config/database");
const db = require("../config/db");
const pool = getPool();


const getAllInternships = async (req, res) => {
  try {
    const { department, search, status } = req.query;
    const clauses = [];
    const params = [];
    let idx = 1;

    if (department && department !== "all") {
      clauses.push(`LOWER(department) = $${idx}`);
      params.push(department.toLowerCase());
      idx++;
    }
    if (status) {
      clauses.push(`LOWER(status) = $${idx}`);
      params.push(status.toLowerCase());
      idx++;
    }
    if (search) {
      clauses.push(`(LOWER(title) LIKE $${idx} OR LOWER(department) LIKE $${idx} OR LOWER(description) LIKE $${idx})`);
      params.push(`%${search.toLowerCase()}%`);
      idx++;
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const q = `SELECT * FROM internships ${where} ORDER BY posted_at DESC`;
    const result = await pool.query(q, params);
    return res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error("[INTERNSHIP CONTROLLER] getAll failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve internships." });
  }
};


const getInternshipById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM internships WHERE id = $1', [id]);
    const item = result.rows[0];
    if (!item) return res.status(404).json({ success: false, message: 'Internship not found.' });
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    console.error('[INTERNSHIP CONTROLLER] getById failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve internship details.' });
  }
};


const createInternship = async (req, res) => {
  try {
    const { title, department, description, vacancies, deadline, supervisor, duration, location } = req.body;
    if (!title || !department || !description || !deadline) return res.status(400).json({ success: false, message: 'Title, department, description, and deadline are required.' });
    const id = `INT${String(Date.now()).slice(-6)}`;
    const posted_at = new Date().toISOString().split('T')[0];
    const q = `INSERT INTO internships (id, title, department, description, vacancies, deadline, supervisor, duration, location, status, posted_at, applicants_count, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW()) RETURNING *`;
    const params = [id, title.trim(), department.trim(), description.trim(), Number(vacancies) || 1, deadline, supervisor || 'HR Officer', duration || '3 Months', location || 'City Hall – Kampala', 'open', posted_at, 0];
    const result = await pool.query(q, params);
    return res.status(201).json({ success: true, message: 'Internship posting created successfully.', data: result.rows[0] });
  } catch (err) {
    console.error('[INTERNSHIP CONTROLLER] create failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to create internship posting.' });
  }
};


const updateInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query('SELECT id FROM internships WHERE id = $1', [id]);
    if (check.rowCount === 0) return res.status(404).json({ success: false, message: 'Internship not found.' });
    const updates = req.body;
    const allowed = ['title','department','description','vacancies','deadline','supervisor','duration','location','status'];
    const sets = [];
    const params = [];
    let idx = 1;
    for (const k of Object.keys(updates)) {
      if (!allowed.includes(k)) continue;
      params.push(updates[k]);
      sets.push(`${k} = $${idx}`);
      idx++;
    }
    if (sets.length === 0) return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    params.push(id);
    const q = `UPDATE internships SET ${sets.join(', ')}, updated_at=NOW() WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(q, params);
    return res.status(200).json({ success: true, message: 'Internship updated successfully.', data: result.rows[0] });
  } catch (err) {
    console.error('[INTERNSHIP CONTROLLER] update failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update internship posting.' });
  }
};


const deleteInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM internships WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Internship not found or already deleted.' });

    const actor = req.user ? { id: req.user.id, role: req.user.role } : null;
    const reason = req.body && req.body.reason ? req.body.reason : req.query && req.query.reason ? req.query.reason : null;
    await db.appendAuditLog({ action: 'delete', table: 'internships', id: result.rows[0].id, actor, reason });
    return res.status(200).json({ success: true, message: 'Internship posting deleted successfully.', id: result.rows[0].id });
  } catch (err) {
    console.error('[INTERNSHIP CONTROLLER] delete failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to delete internship posting.' });
  }
};

module.exports = {
  getAllInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
};
