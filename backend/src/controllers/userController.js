// backend/src/controllers/userController.js
const { getPool } = require('../config/database');
const bcrypt = require('bcryptjs');

const pool = getPool();

const getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let where = [];
    let params = [];
    if (role && role !== 'all') { params.push(role); where.push(`role = $${params.length}`); }
    if (status && status !== 'all') { params.push(status); where.push(`status = $${params.length}`); }
    if (search) { params.push(`%${search.toLowerCase()}%`); where.push(`(LOWER(name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR LOWER(phone) LIKE $${params.length})`); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const q = `SELECT id, name, first_name, last_name, email, role, phone, status, is_verified, created_at FROM users ${whereSql} ORDER BY created_at DESC`;
    const result = await pool.query(q, params);
    return res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('[USER CONTROLLER] getAll failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    // Try by id first
    let result = await pool.query('SELECT id, name, first_name, last_name, email, role, phone, status, is_verified, created_at FROM users WHERE id = $1', [id]);
    let user = result.rows[0];
    if (!user) {
      // try by email
      result = await pool.query('SELECT id, name, first_name, last_name, email, role, phone, status, is_verified, created_at FROM users WHERE LOWER(email) = LOWER($1)', [id]);
      user = result.rows[0];
    }
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('[USER CONTROLLER] getById failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve user details.' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, title, department } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email)=LOWER($1)', [normalizedEmail]);
    if (existing.rowCount > 0) return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    const passwordHash = await bcrypt.hash(password, 10);
    const id = `U${String(Date.now()).slice(-6)}`;
    await pool.query('INSERT INTO users (id, name, first_name, last_name, email, password_hash, role, phone, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())', [id, name, name.split(' ')[0] || '', name.split(' ').slice(1).join(' ') || '', normalizedEmail, passwordHash, role, phone || null, 'active']);
    return res.status(201).json({ success: true, message: 'User created successfully.' });
  } catch (err) {
    console.error('[USER CONTROLLER] create failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const allowed = ['name','phone','district','status','role','title','department'];
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
    const q = `UPDATE users SET ${sets.join(', ')}, updated_at=NOW() WHERE id = $${idx}`;
    await pool.query(q, params);
    return res.status(200).json({ success: true, message: 'User updated.' });
  } catch (err) {
    console.error('[USER CONTROLLER] update failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, message: 'User deleted.' });
  } catch (err) {
    console.error('[USER CONTROLLER] delete failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
