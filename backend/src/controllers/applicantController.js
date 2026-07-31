
const { getPool } = require('../config/database');

// GET /api/applicants — HR/Admin can view all registered applicants
const getAllApplicants = async (req, res) => {
  try {
    const pool = getPool();
    const { search } = req.query;
    let where = '';
    let params = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      where = `WHERE LOWER(full_name) LIKE $1 OR LOWER(email) LIKE $1`;
    }

    const result = await pool.query(
      `SELECT
         applicant_id  AS id,
         full_name     AS name,
         email,
         phone_number  AS phone,
         national_id_number AS national_id,
         date_of_birth,
         institution,
         course_of_study AS course,
         academic_year_level AS year_level,
         created_at
       FROM applicants
       ${where}
       ORDER BY created_at DESC`,
      params
    );

    return res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('[APPLICANT CONTROLLER] getAll failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve applicants.' });
  }
};

// PUT /api/applicants/profile — Applicant updates their own profile
const updateApplicantProfile = async (req, res) => {
  try {
    const pool = getPool();
    const applicantId = req.user?.id;
    if (!applicantId) return res.status(401).json({ success: false, message: 'Authentication required.' });

    const { name, phone, institution, course, academic_year_level } = req.body;

    const sets = [];
    const params = [];
    let idx = 1;

    if (name)                { sets.push(`full_name = $${idx}`);              params.push(name); idx++; }
    if (phone)               { sets.push(`phone_number = $${idx}`);           params.push(phone); idx++; }
    if (institution)         { sets.push(`institution = $${idx}`);             params.push(institution); idx++; }
    if (course)              { sets.push(`course_of_study = $${idx}`);        params.push(course); idx++; }
    if (academic_year_level) { sets.push(`academic_year_level = $${idx}`);    params.push(academic_year_level); idx++; }

    if (sets.length === 0) return res.status(400).json({ success: false, message: 'No valid fields to update.' });

    params.push(applicantId);
    const result = await pool.query(
      `UPDATE applicants SET ${sets.join(', ')} WHERE applicant_id::text = $${idx} RETURNING applicant_id AS id, full_name AS name, email, phone_number AS phone, institution, course_of_study AS course, academic_year_level AS year_level`,
      params
    );

    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Applicant not found.' });
    return res.status(200).json({ success: true, message: 'Profile updated successfully.', data: result.rows[0] });
  } catch (err) {
    console.error('[APPLICANT CONTROLLER] updateProfile failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// GET /api/applicants/:id — Get single applicant with their applications
const getApplicantById = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
         applicant_id  AS id,
         full_name     AS name,
         email,
         phone_number  AS phone,
         national_id_number AS national_id,
         date_of_birth,
         institution,
         course_of_study AS course,
         academic_year_level AS year_level,
         created_at
       FROM applicants
       WHERE applicant_id::text = $1 OR LOWER(email) = LOWER($1)`,
      [id]
    );

    const applicant = result.rows[0];
    if (!applicant) return res.status(404).json({ success: false, message: 'Applicant not found.' });

    // Fetch their applications
    const appsResult = await pool.query(
      `SELECT a.*, i.title AS "internshipTitle", i.department
       FROM applications a
       LEFT JOIN internships i ON i.id = a.internship_id
       WHERE a.applicant_id = $1
       ORDER BY a.submitted_at DESC`,
      [id]
    );

    return res.status(200).json({ success: true, data: { ...applicant, applications: appsResult.rows } });
  } catch (err) {
    console.error('[APPLICANT CONTROLLER] getById failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve applicant.' });
  }
};

module.exports = { getAllApplicants, getApplicantById, updateApplicantProfile };
