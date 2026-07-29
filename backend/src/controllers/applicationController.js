// backend/src/controllers/applicationController.js
const { getPool } = require("../config/database");
const pool = getPool();
const isStaff = (user) => ["hr", "admin"].includes(String(user?.role).toLowerCase());

const ensureTimelineColumn = async (client) => {
  await client.query("ALTER TABLE applications ADD COLUMN IF NOT EXISTS timeline JSONB");
};

const applicationSelect = `
  SELECT
    a.*,
    a.internship_id AS "internshipId",
    a.applicant_id AS "applicantId",
    a.submitted_at AS "submittedAt",
    a.review_note AS "reviewNote",
    i.title AS "internshipTitle",
    i.department AS department,
    u.name AS "applicantName",
    u.gender AS gender
  FROM applications a
  JOIN internships i ON i.id = a.internship_id
  JOIN users u ON u.id = a.applicant_id`;

/**
 * Retrieve applications (with applicantId, internshipId, status filters)
 */
const getAllApplications = async (req, res) => {
  try {
    const { applicantId, internshipId, status } = req.query;
    const clauses = [];
    const params = [];
    let idx = 1;
    // Applicants never choose the applicant ID filter; it is derived from their JWT.
    const effectiveApplicantId = isStaff(req.user) ? applicantId : req.user.id;
    if (effectiveApplicantId) { clauses.push(`a.applicant_id = $${idx}`); params.push(effectiveApplicantId); idx++; }
    if (internshipId) { clauses.push(`a.internship_id = $${idx}`); params.push(internshipId); idx++; }
    if (status) { clauses.push(`LOWER(a.status) = $${idx}`); params.push(status.toLowerCase()); idx++; }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const q = `${applicationSelect} ${where} ORDER BY a.submitted_at DESC`;
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
    const query = isStaff(req.user)
      ? `${applicationSelect} WHERE a.id = $1`
      : `${applicationSelect} WHERE a.id = $1 AND a.applicant_id = $2`;
    const result = await pool.query(query, isStaff(req.user) ? [id] : [id, req.user.id]);
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
    const { internshipId, university, course, gpa } = req.body;
    if (!internshipId || !university || !course) return res.status(400).json({ success: false, message: 'Internship, university, and course are required.' });

    const client = await pool.connect();
    try {
      await ensureTimelineColumn(client);
      await client.query('BEGIN');
      const internshipRes = await client.query('SELECT * FROM internships WHERE id = $1 FOR UPDATE', [internshipId]);
      const internship = internshipRes.rows[0];
      if (!internship || internship.status !== "open" || new Date(internship.deadline) < new Date()) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: "This internship is not accepting applications." });
      }

      const id = `APP${String(Date.now()).slice(-6)}`;
      const timeline = [{ status: 'submitted', date: new Date().toISOString(), note: 'Application submitted successfully.' }];
      const q = `INSERT INTO applications (id, internship_id, applicant_id, university, course, gpa, status, review_note, submitted_at, timeline, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW()) RETURNING *`;
      const params = [id, internshipId, req.user.id, university, course, gpa || null, 'submitted', null, new Date().toISOString(), JSON.stringify(timeline)];
      const appRes = await client.query(q, params);

      await client.query('UPDATE internships SET applicants_count = COALESCE(applicants_count,0) + 1, updated_at=NOW() WHERE id = $1', [internshipId]);

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
      if (!existing) return res.status(404).json({ success: false, message: 'Application not found.' });

      if (!isStaff(req.user) && (existing.applicant_id !== req.user.id || req.body.status !== "withdrawn" || Object.keys(req.body).some((key) => key !== "status"))) {
        return res.status(403).json({ success: false, message: "Applicants may only withdraw their own application." });
      }

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
      if (sets.length === 0) return res.status(400).json({ success: false, message: 'No valid fields to update.' });
      params.push(id);
      const q = `UPDATE applications SET ${sets.join(', ')}, updated_at=NOW() WHERE id = $${idx} RETURNING *`;
      const result = await client.query(q, params);
      return res.status(200).json({ success: true, message: 'Application updated successfully.', data: result.rows[0] });
    } catch (err) {
      throw err;
    } finally {
      client.release();
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
