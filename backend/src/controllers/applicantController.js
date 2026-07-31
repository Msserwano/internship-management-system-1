
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

module.exports = { getAllApplicants, getApplicantById };
