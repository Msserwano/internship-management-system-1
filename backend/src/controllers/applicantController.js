const { getPool } = require('../config/database');

// Fix: Use a module-level flag so ALTER TABLE migrations run only once,
// not on every incoming request (was causing 8 unnecessary DB round-trips per call)
let applicantColumnsMigrated = false;
const ensureApplicantColumns = async (pool) => {
  if (applicantColumnsMigrated) return;
  const queries = [
    "ALTER TABLE applicants ADD COLUMN IF NOT EXISTS gender VARCHAR(20)",
    "ALTER TABLE applicants ADD COLUMN IF NOT EXISTS district VARCHAR(100)",
    "ALTER TABLE applicants ADD COLUMN IF NOT EXISTS address VARCHAR(255)",
    "ALTER TABLE applicants ADD COLUMN IF NOT EXISTS nationality VARCHAR(100) DEFAULT 'Ugandan'",
    "ALTER TABLE applicants ADD COLUMN IF NOT EXISTS gpa VARCHAR(20)",
    "ALTER TABLE applicants ADD COLUMN IF NOT EXISTS skills TEXT[]",
    "ALTER TABLE applicants ADD COLUMN IF NOT EXISTS languages TEXT[]",
    "ALTER TABLE applicants ADD COLUMN IF NOT EXISTS emergency_contact JSONB"
  ];
  for (const q of queries) {
    try { await pool.query(q); } catch (e) { /* ignore if already exists */ }
  }
  applicantColumnsMigrated = true;
};

// Run immediately at module load
(async () => {
  try { await ensureApplicantColumns(getPool()); } catch (e) { /* pool may not be ready yet */ }
})();

// GET /api/applicants — HR/Admin can view all registered applicants
const getAllApplicants = async (req, res) => {
  try {
    const pool = getPool();
    await ensureApplicantColumns(pool);
    const { search } = req.query;
    let havingClause = '';
    let params = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      havingClause = `WHERE (
        LOWER(ap.full_name) LIKE $1
        OR LOWER(ap.email) LIKE $1
        OR LOWER(COALESCE(ap.institution, latest_app.university, '')) LIKE $1
        OR LOWER(COALESCE(ap.course_of_study, latest_app.course, '')) LIKE $1
        OR LOWER(COALESCE(ap.phone_number, '')) LIKE $1
      )`;
    }

    // Join with the most recent application to fill in missing profile fields
    const result = await pool.query(
      `SELECT
         ap.applicant_id                                     AS id,
         ap.full_name                                        AS name,
         ap.email,
         ap.phone_number                                     AS phone,
         ap.national_id_number                               AS national_id,
         ap.date_of_birth                                    AS dob,
         ap.gender,
         ap.district,
         ap.address,
         ap.nationality,
         -- Prefer profile institution; fall back to latest application university
         COALESCE(NULLIF(ap.institution,''), latest_app.university)          AS institution,
         COALESCE(NULLIF(ap.course_of_study,''), latest_app.course)          AS course,
         ap.academic_year_level                              AS year_of_study,
         -- Prefer profile GPA; fall back to latest application GPA
         COALESCE(NULLIF(ap.gpa::text,''), latest_app.gpa::text)             AS gpa,
         ap.skills,
         ap.languages,
         ap.emergency_contact,
         ap.created_at,
         COALESCE(app_counts.total_apps, 0)                 AS application_count,
         latest_app.status                                  AS latest_status
       FROM applicants ap
       -- Latest application per applicant (for fallback data)
       LEFT JOIN LATERAL (
         SELECT university, course, gpa, status
         FROM applications
         WHERE applicant_id = ap.applicant_id::text
         ORDER BY submitted_at DESC
         LIMIT 1
       ) latest_app ON TRUE
       -- Total application count
       LEFT JOIN (
         SELECT applicant_id, COUNT(*) AS total_apps
         FROM applications
         GROUP BY applicant_id
       ) app_counts ON app_counts.applicant_id = ap.applicant_id::text
       ${havingClause}
       ORDER BY ap.created_at DESC`,
      params
    );

    return res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('[APPLICANT CONTROLLER] getAll failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve applicants.' });
  }
};

// GET /api/applicants/profile — Get currently logged in applicant's profile
const getApplicantProfile = async (req, res) => {
  try {
    const pool = getPool();
    await ensureApplicantColumns(pool);
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required.' });

    const result = await pool.query(
      `SELECT
         applicant_id        AS id,
         full_name           AS name,
         email,
         phone_number        AS phone,
         gender,
         date_of_birth       AS dob,
         district,
         address,
         nationality,
         institution         AS university,
         course_of_study     AS course,
         academic_year_level AS "yearOfStudy",
         gpa,
         skills,
         languages,
         emergency_contact   AS "emergencyContact",
         created_at          AS "createdAt"
       FROM applicants
       WHERE applicant_id::text = $1 OR LOWER(email) = LOWER($2)`,
      [userId, req.user?.email || '']
    );

    let profile = result.rows[0];
    if (!profile) {
      // Return default shape based on auth token payload if record not found
      profile = {
        id: userId,
        name: req.user?.name || '',
        email: req.user?.email || '',
        phone: '',
        gender: '',
        dob: '',
        district: '',
        address: '',
        nationality: 'Ugandan',
        university: '',
        course: '',
        yearOfStudy: '',
        gpa: '',
        skills: [],
        languages: [],
        emergencyContact: null,
      };
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (err) {
    console.error('[APPLICANT CONTROLLER] getProfile failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve applicant profile.' });
  }
};

// PUT /api/applicants/profile — Applicant updates their own profile
const updateApplicantProfile = async (req, res) => {
  try {
    const pool = getPool();
    await ensureApplicantColumns(pool);
    const applicantId = req.user?.id;
    if (!applicantId) return res.status(401).json({ success: false, message: 'Authentication required.' });

    const {
      name, phone, gender, dob, district, address, nationality,
      institution, university, course, academic_year_level, yearOfStudy,
      gpa, skills, languages, emergencyContact
    } = req.body;

    const uniVal    = institution || university;
    const yearVal   = academic_year_level || yearOfStudy;
    const skillsArr = Array.isArray(skills) ? skills : (skills ? String(skills).split(',').map(s=>s.trim()) : null);
    const langArr   = Array.isArray(languages) ? languages : (languages ? String(languages).split(',').map(l=>l.trim()) : null);
    const emergencyJson = emergencyContact ? JSON.stringify(emergencyContact) : null;

    const sets = [];
    const params = [];
    let idx = 1;

    if (name !== undefined)                  { sets.push(`full_name = $${idx}`);           params.push(name); idx++; }
    if (phone !== undefined)                 { sets.push(`phone_number = $${idx}`);        params.push(phone); idx++; }
    if (gender !== undefined)                { sets.push(`gender = $${idx}`);             params.push(gender); idx++; }
    if (dob !== undefined)                   { sets.push(`date_of_birth = $${idx}`);      params.push(dob || null); idx++; }
    if (district !== undefined)              { sets.push(`district = $${idx}`);           params.push(district); idx++; }
    if (address !== undefined)               { sets.push(`address = $${idx}`);            params.push(address); idx++; }
    if (nationality !== undefined)           { sets.push(`nationality = $${idx}`);        params.push(nationality); idx++; }
    if (uniVal !== undefined)                { sets.push(`institution = $${idx}`);        params.push(uniVal); idx++; }
    if (course !== undefined)                { sets.push(`course_of_study = $${idx}`);     params.push(course); idx++; }
    if (yearVal !== undefined)               { sets.push(`academic_year_level = $${idx}`); params.push(yearVal); idx++; }
    if (gpa !== undefined)                   { sets.push(`gpa = $${idx}`);                params.push(gpa); idx++; }
    if (skillsArr !== null)                  { sets.push(`skills = $${idx}`);             params.push(skillsArr); idx++; }
    if (langArr !== null)                    { sets.push(`languages = $${idx}`);          params.push(langArr); idx++; }
    if (emergencyJson !== null)              { sets.push(`emergency_contact = $${idx}`);  params.push(emergencyJson); idx++; }

    if (sets.length === 0) return res.status(400).json({ success: false, message: 'No valid fields to update.' });

    params.push(applicantId);
    params.push(req.user?.email || '');

    const result = await pool.query(
      `UPDATE applicants
       SET ${sets.join(', ')}
       WHERE applicant_id::text = $${idx} OR LOWER(email) = LOWER($${idx+1})
       RETURNING
         applicant_id AS id,
         full_name AS name,
         email,
         phone_number AS phone,
         gender,
         date_of_birth AS dob,
         district,
         address,
         nationality,
         institution AS university,
         course_of_study AS course,
         academic_year_level AS "yearOfStudy",
         gpa,
         skills,
         languages,
         emergency_contact AS "emergencyContact"`,
      params
    );

    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Applicant not found.' });
    return res.status(200).json({ success: true, message: 'Profile updated successfully.', data: result.rows[0] });
  } catch (err) {
    console.error('[APPLICANT CONTROLLER] updateProfile failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// GET /api/applicants/:id — Get single applicant with their applications (HR/Admin)
const getApplicantById = async (req, res) => {
  try {
    const pool = getPool();
    await ensureApplicantColumns(pool);
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
         applicant_id  AS id,
         full_name     AS name,
         email,
         phone_number  AS phone,
         national_id_number AS national_id,
         date_of_birth AS dob,
         gender,
         district,
         address,
         nationality,
         institution   AS university,
         course_of_study AS course,
         academic_year_level AS year_of_study,
         gpa,
         skills,
         languages,
         emergency_contact AS "emergencyContact",
         created_at
       FROM applicants
       WHERE applicant_id::text = $1 OR LOWER(email) = LOWER($1)`,
      [id]
    );

    const applicant = result.rows[0];
    if (!applicant) return res.status(404).json({ success: false, message: 'Applicant not found.' });

    // Fetch their submitted applications
    const appsRes = await pool.query(
      `SELECT a.id, a.status, a.submitted_at AS "submittedAt", i.title AS "internshipTitle", i.department
       FROM applications a
       JOIN internships i ON i.id = a.internship_id
       WHERE a.applicant_id = $1
       ORDER BY a.submitted_at DESC`,
      [applicant.id]
    );

    applicant.applications = appsRes.rows;
    return res.status(200).json({ success: true, data: applicant });
  } catch (err) {
    console.error('[APPLICANT CONTROLLER] getById failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve applicant details.' });
  }
};

module.exports = { getAllApplicants, getApplicantProfile, updateApplicantProfile, getApplicantById };
