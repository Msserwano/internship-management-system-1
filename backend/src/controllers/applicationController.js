// backend/src/controllers/applicationController.js
const { getPool } = require("../config/database");
const pool = getPool();

const ensureTimelineColumn = async (client) => {
  await client.query("ALTER TABLE applications ADD COLUMN IF NOT EXISTS timeline JSONB");
};

/**
 * Retrieve applications (with applicantId, internshipId, status filters)
 */
const getAllApplications = async (req, res) => {
  try {
    const { applicantId, internshipId, status } = req.query;
    const clauses = [];
    const params = [];
    let idx = 1;
    if (applicantId) { clauses.push(`applicant_id = $${idx}`); params.push(applicantId); idx++; }
    if (internshipId) { clauses.push(`internship_id = $${idx}`); params.push(internshipId); idx++; }
    if (status) { clauses.push(`LOWER(status) = $${idx}`); params.push(status.toLowerCase()); idx++; }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const q = `SELECT * FROM applications ${where} ORDER BY submitted_at DESC`;
    const result = await pool.query(q, params);
    return res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('[APPLICATION CONTROLLER] getAll failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve applications.' });
  }
};

/**
 * Retrieve single application by ID
 */
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
    const item = result.rows[0];
    if (!item) return res.status(404).json({ success: false, message: 'Application not found.' });
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    console.error('[APPLICATION CONTROLLER] getById failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve application.' });
  }
};

/**
 * Store / Write a new application (Create)
 */
const submitApplication = async (req, res) => {
  try {
    const { internshipId, applicantId, applicantName, university, course, gpa } = req.body;
    if (!internshipId || !university || !course) return res.status(400).json({ success: false, message: 'Internship, university, and course are required.' });

    const client = await pool.connect();
    try {
      await ensureTimelineColumn(client);
      await client.query('BEGIN');
      const internshipRes = await client.query('SELECT * FROM internships WHERE id = $1 FOR UPDATE', [internshipId]);
      const internship = internshipRes.rows[0];

      const id = `APP${String(Date.now()).slice(-6)}`;
      const timeline = [{ status: 'submitted', date: new Date().toISOString(), note: 'Application submitted successfully.' }];
      const q = `INSERT INTO applications (id, internship_id, applicant_id, university, course, gpa, status, review_note, submitted_at, timeline, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW()) RETURNING *`;
      const params = [id, internshipId, applicantId || null, university, course, gpa || null, 'submitted', null, new Date().toISOString(), JSON.stringify(timeline)];
      const appRes = await client.query(q, params);

      if (internship) {
        await client.query('UPDATE internships SET applicants_count = COALESCE(applicants_count,0) + 1, updated_at=NOW() WHERE id = $1', [internshipId]);
      }

      await client.query('COMMIT');
      return res.status(201).json({ success: true, message: 'Application submitted successfully.', data: appRes.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[APPLICATION CONTROLLER] submit failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to submit application.' });
  }
};

/**
 * Edit / Modify application status or review notes (Update)
 */
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    try {
      await ensureTimelineColumn(client);
      const existingRes = await client.query('SELECT * FROM applications WHERE id = $1', [id]);
      const existing = existingRes.rows[0];
      if (!existing) { client.release(); return res.status(404).json({ success: false, message: 'Application not found.' }); }

      const { status, reviewNote } = req.body;
      let timeline = existing.timeline || [];
      if (status && status !== existing.status) {
        timeline = timeline.concat([{ status, date: new Date().toISOString(), note: reviewNote || `Status updated to ${status}.` }]);
      }

      const updates = { ...req.body, timeline };
      // Build update query
      const allowed = ['status','review_note','timeline'];
      const sets = [];
      const params = [];
      let idx = 1;
      for (const k of Object.keys(updates)) {
        const col = k === 'reviewNote' ? 'review_note' : k;
        if (!allowed.includes(col)) continue;
        params.push(col === 'timeline' ? JSON.stringify(updates[k]) : updates[k]);
        sets.push(`${col} = $${idx}`);
        idx++;
      }
      if (sets.length === 0) { client.release(); return res.status(400).json({ success: false, message: 'No valid fields to update.' }); }
      params.push(id);
      const q = `UPDATE applications SET ${sets.join(', ')}, updated_at=NOW() WHERE id = $${idx} RETURNING *`;
      const result = await client.query(q, params);
      client.release();
      return res.status(200).json({ success: true, message: 'Application updated successfully.', data: result.rows[0] });
    } catch (err) {
      client.release();
      throw err;
    }
  } catch (err) {
    console.error('[APPLICATION CONTROLLER] update failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update application.' });
  }
};

/**
 * Delete application
 */
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM applications WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Application not found or already deleted.' });
    return res.status(200).json({ success: true, message: 'Application deleted successfully.', id: result.rows[0].id });
  } catch (err) {
    console.error('[APPLICATION CONTROLLER] delete failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to delete application.' });
  }
};

module.exports = {
  getAllApplications,
  getApplicationById,
  submitApplication,
  updateApplication,
  deleteApplication,
};
