
const { getPool } = require("../config/database");

const isStaff = (user) => ["hr", "admin"].includes(String(user?.role).toLowerCase());

const pool = () => getPool();

// Shared SELECT with useful joins
const evalSelect = `
  SELECT
    e.*,
    e.application_id   AS "applicationId",
    e.applicant_id     AS "applicantId",
    e.internship_id    AS "internshipId",
    e.overall_rating   AS "overallRating",
    e.supervisor_rating AS "supervisorRating",
    e.learning_rating  AS "learningRating",
    e.facilities_rating AS "facilitiesRating",
    e.would_recommend  AS "wouldRecommend",
    e.submitted_at     AS "submittedAt",
    i.title            AS "internshipTitle",
    COALESCE(i.department, 'General') AS department,
    COALESCE(appl.full_name, u.name, 'Applicant') AS "applicantName",
    COALESCE(appl.email,    u.email, '')           AS "applicantEmail"
  FROM internship_evaluations e
  LEFT JOIN internships i       ON i.id  = e.internship_id
  LEFT JOIN applicants appl     ON appl.applicant_id::text = e.applicant_id
  LEFT JOIN users u             ON u.id::text = e.applicant_id`;

// ---------------------------------------------------------------------------
// Ensure the evaluations table exists (migration-safe inline DDL)
// ---------------------------------------------------------------------------
const ensureTable = async () => {
  const db = pool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS internship_evaluations (
      id                  BIGSERIAL    PRIMARY KEY,
      application_id      VARCHAR(50)  NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      applicant_id        VARCHAR(255) NOT NULL,
      internship_id       VARCHAR(50)  NOT NULL REFERENCES internships(id)   ON DELETE CASCADE,
      overall_rating      SMALLINT     NOT NULL CHECK (overall_rating    BETWEEN 1 AND 5),
      supervisor_rating   SMALLINT     NOT NULL CHECK (supervisor_rating  BETWEEN 1 AND 5),
      learning_rating     SMALLINT     NOT NULL CHECK (learning_rating    BETWEEN 1 AND 5),
      facilities_rating   SMALLINT     NOT NULL CHECK (facilities_rating  BETWEEN 1 AND 5),
      would_recommend     BOOLEAN      NOT NULL DEFAULT TRUE,
      highlights          TEXT,
      challenges          TEXT,
      suggestions         TEXT,
      submitted_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
      CONSTRAINT uq_evaluation_per_application UNIQUE (application_id)
    )
  `);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_eval_applicant_id  ON internship_evaluations (applicant_id)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_eval_internship_id ON internship_evaluations (internship_id)`);
};

// ---------------------------------------------------------------------------
// POST /api/evaluations  — applicant submits evaluation
// ---------------------------------------------------------------------------
const submitEvaluation = async (req, res) => {
  try {
    await ensureTable();
    const db = pool();
    const applicantId = req.user.id;
    const {
      applicationId,
      internshipId,
      overallRating,
      supervisorRating,
      learningRating,
      facilitiesRating,
      wouldRecommend,
      highlights,
      challenges,
      suggestions,
    } = req.body;

    // Validate required fields
    if (!applicationId || !internshipId) {
      return res.status(400).json({ success: false, message: "applicationId and internshipId are required." });
    }
    if (!overallRating || !supervisorRating || !learningRating || !facilitiesRating) {
      return res.status(400).json({ success: false, message: "All four star ratings are required." });
    }

    // Verify the application belongs to this applicant and is accepted/completed
    const appCheck = await db.query(
      `SELECT id, status FROM applications WHERE id = $1 AND applicant_id = $2`,
      [applicationId, applicantId]
    );
    if (appCheck.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Application not found or does not belong to you." });
    }
    const appStatus = String(appCheck.rows[0].status).toLowerCase();
    const allowedStatuses = ["accepted", "offer_accepted", "cleared", "completed"];
    if (!allowedStatuses.includes(appStatus)) {
      return res.status(403).json({
        success: false,
        message: "Evaluation is only available after your internship has been accepted/completed.",
      });
    }

    // Check for duplicate
    const dupCheck = await db.query(
      `SELECT id FROM internship_evaluations WHERE application_id = $1`,
      [applicationId]
    );
    if (dupCheck.rowCount > 0) {
      return res.status(409).json({ success: false, message: "You have already submitted an evaluation for this internship." });
    }

    const insert = await db.query(
      `INSERT INTO internship_evaluations
         (application_id, applicant_id, internship_id,
          overall_rating, supervisor_rating, learning_rating, facilities_rating,
          would_recommend, highlights, challenges, suggestions)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        applicationId, applicantId, internshipId,
        overallRating, supervisorRating, learningRating, facilitiesRating,
        wouldRecommend ?? true,
        highlights || null, challenges || null, suggestions || null,
      ]
    );

    return res.status(201).json({ success: true, data: insert.rows[0] });
  } catch (err) {
    console.error("[EVALUATION] submitEvaluation failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to submit evaluation." });
  }
};

// ---------------------------------------------------------------------------
// GET /api/evaluations/my  — applicant fetches their own evaluation(s)
// ---------------------------------------------------------------------------
const getMyEvaluations = async (req, res) => {
  try {
    await ensureTable();
    const db = pool();
    const applicantId = req.user.id;
    const result = await db.query(
      `${evalSelect} WHERE e.applicant_id = $1 ORDER BY e.submitted_at DESC`,
      [applicantId]
    );
    return res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error("[EVALUATION] getMyEvaluations failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to fetch evaluations." });
  }
};

// ---------------------------------------------------------------------------
// GET /api/evaluations  — HR/admin fetches all evaluations
// ---------------------------------------------------------------------------
const getAllEvaluations = async (req, res) => {
  try {
    await ensureTable();
    const db = pool();

    if (!isStaff(req.user)) {
      return res.status(403).json({ success: false, message: "Forbidden: HR or Admin access only." });
    }

    const { internshipId, department, search } = req.query;
    const clauses = [];
    const params = [];
    let idx = 1;

    if (internshipId) {
      clauses.push(`e.internship_id = $${idx}`);
      params.push(internshipId);
      idx++;
    }
    if (department) {
      clauses.push(`LOWER(i.department) = $${idx}`);
      params.push(department.toLowerCase());
      idx++;
    }
    if (search) {
      clauses.push(`(
        LOWER(COALESCE(appl.full_name, u.name, '')) ILIKE $${idx}
        OR LOWER(i.title) ILIKE $${idx}
      )`);
      params.push(`%${search.toLowerCase()}%`);
      idx++;
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const q = `${evalSelect} ${where} ORDER BY e.submitted_at DESC`;
    const result = await db.query(q, params);

    return res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error("[EVALUATION] getAllEvaluations failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to fetch evaluations." });
  }
};

// ---------------------------------------------------------------------------
// GET /api/evaluations/:id  — single evaluation (HR/admin or own applicant)
// ---------------------------------------------------------------------------
const getEvaluationById = async (req, res) => {
  try {
    await ensureTable();
    const db = pool();
    const { id } = req.params;
    const result = await db.query(`${evalSelect} WHERE e.id = $1`, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Evaluation not found." });
    }
    const evaluation = result.rows[0];
    // Non-staff can only view their own
    if (!isStaff(req.user) && evaluation.applicant_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }
    return res.status(200).json({ success: true, data: evaluation });
  } catch (err) {
    console.error("[EVALUATION] getEvaluationById failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to fetch evaluation." });
  }
};

module.exports = { submitEvaluation, getMyEvaluations, getAllEvaluations, getEvaluationById };
