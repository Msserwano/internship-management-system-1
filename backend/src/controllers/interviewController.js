// backend/src/controllers/interviewController.js
const { getPool } = require("../config/database");
const pool = getPool();

/**
 * Retrieve interviews (with optional status/applicationId filter)
 */
const getAllInterviews = async (req, res) => {
  try {
    const { applicationId, status } = req.query;
    const clauses = [];
    const params = [];
    let idx = 1;
    if (applicationId) { clauses.push(`application_id = $${idx}`); params.push(applicationId); idx++; }
    if (status) { clauses.push(`LOWER(status) = $${idx}`); params.push(status.toLowerCase()); idx++; }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const q = `SELECT * FROM interviews ${where} ORDER BY interview_date DESC`;
    const result = await pool.query(q, params);
    return res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('[INTERVIEW CONTROLLER] getAll failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve interviews.' });
  }
};

/**
 * Retrieve interview by ID
 */
const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM interviews WHERE id = $1', [id]);
    const item = result.rows[0];
    if (!item) return res.status(404).json({ success: false, message: 'Interview record not found.' });
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    console.error('[INTERVIEW CONTROLLER] getById failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve interview details.' });
  }
};

/**
 * Store / Schedule a new interview (Create)
 */
const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, applicantName, internshipTitle, department, date, time, venue, meetingLink, instructions } = req.body;
    if (!applicationId || !date || !time || !venue) return res.status(400).json({ success: false, message: 'Application, date, time, and venue are required.' });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const id = `IVW${String(Date.now()).slice(-6)}`;
      const q = `INSERT INTO interviews (id, application_id, interview_date, interview_time, venue, meeting_link, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING *`;
      const params = [id, applicationId, date, time, venue.trim(), meetingLink || null, 'scheduled'];
      const resIns = await client.query(q, params);
      // update application status
      await client.query('UPDATE applications SET status = $1, updated_at=NOW() WHERE id = $2', ['interview', applicationId]);
      await client.query('COMMIT');
      client.release();
      return res.status(201).json({ success: true, message: 'Interview scheduled successfully.', data: resIns.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      client.release();
      throw err;
    }
  } catch (err) {
    console.error('[INTERVIEW CONTROLLER] schedule failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to schedule interview.' });
  }
};

/**
 * Edit / Modify interview details (Update)
 */
const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query('SELECT id FROM interviews WHERE id = $1', [id]);
    if (check.rowCount === 0) return res.status(404).json({ success: false, message: 'Interview not found.' });
    const updates = req.body;
    const allowed = ['interview_date','interview_time','venue','meeting_link','status','instructions'];
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
    const q = `UPDATE interviews SET ${sets.join(', ')}, updated_at=NOW() WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(q, params);
    return res.status(200).json({ success: true, message: 'Interview schedule updated successfully.', data: result.rows[0] });
  } catch (err) {
    console.error('[INTERVIEW CONTROLLER] update failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update interview details.' });
  }
};

/**
 * Delete / Cancel interview
 */
const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM interviews WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Interview record not found or already deleted.' });
    return res.status(200).json({ success: true, message: 'Interview record deleted successfully.', id: result.rows[0].id });
  } catch (err) {
    console.error('[INTERVIEW CONTROLLER] delete failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to delete interview record.' });
  }
};

module.exports = {
  getAllInterviews,
  getInterviewById,
  scheduleInterview,
  updateInterview,
  deleteInterview,
};
