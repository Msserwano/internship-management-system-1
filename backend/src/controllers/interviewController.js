
const { getPool } = require("../config/database");
const isStaff = (user) => ["hr", "admin"].includes(String(user?.role).toLowerCase());


const getAllInterviews = async (req, res) => {
  try {
    const pool = getPool();
    const { applicationId, status } = req.query;
    const clauses = [];
    const params = [];
    let idx = 1;
    if (applicationId) { clauses.push(`application_id = $${idx}`); params.push(applicationId); idx++; }
    if (status) { clauses.push(`LOWER(status) = $${idx}`); params.push(status.toLowerCase()); idx++; }
    if (!isStaff(req.user)) { clauses.push(`a.applicant_id = $${idx}`); params.push(req.user.id); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const q = `SELECT i.* FROM interviews i JOIN applications a ON a.id = i.application_id ${where.replaceAll('application_id', 'i.application_id').replaceAll('LOWER(status)', 'LOWER(i.status)')} ORDER BY i.interview_date DESC`;
    const result = await pool.query(q, params);
    return res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('[INTERVIEW CONTROLLER] getAll failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve interviews.' });
  }
};


const getInterviewById = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const query = isStaff(req.user)
      ? 'SELECT * FROM interviews WHERE id = $1'
      : 'SELECT i.* FROM interviews i JOIN applications a ON a.id = i.application_id WHERE i.id = $1 AND a.applicant_id = $2';
    const result = await pool.query(query, isStaff(req.user) ? [id] : [id, req.user.id]);
    const item = result.rows[0];
    if (!item) return res.status(404).json({ success: false, message: 'Interview record not found.' });
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    console.error('[INTERVIEW CONTROLLER] getById failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve interview details.' });
  }
};


const scheduleInterview = async (req, res) => {
  try {
    const pool = getPool();
    const { applicationId, applicantName, internshipTitle, department, date, time, venue, meetingLink, instructions } = req.body;
    if (!applicationId || !date || !time || !venue) return res.status(400).json({ success: false, message: 'Application, date, time, and venue are required.' });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const id = `IVW${String(Date.now()).slice(-6)}`;
      const q = `INSERT INTO interviews (id, application_id, interview_date, interview_time, venue, meeting_link, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING *`;
      const params = [id, applicationId, date, time, venue.trim(), meetingLink || null, 'scheduled'];
      const resIns = await client.query(q, params);

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


const updateInterview = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const check = await pool.query('SELECT i.id, a.applicant_id FROM interviews i JOIN applications a ON a.id = i.application_id WHERE i.id = $1', [id]);
    if (check.rowCount === 0) return res.status(404).json({ success: false, message: 'Interview not found.' });
    const updates = req.body;
    if (!isStaff(req.user) && (check.rows[0].applicant_id !== req.user.id || !["accepted", "declined"].includes(updates.status) || Object.keys(updates).some((key) => key !== "status"))) {
      return res.status(403).json({ success: false, message: "Applicants may only accept or decline their own interview." });
    }
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


const deleteInterview = async (req, res) => {
  try {
    const pool = getPool();
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
