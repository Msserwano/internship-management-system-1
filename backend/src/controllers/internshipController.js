
const { getPool } = require("../config/database");

const pool = getPool();

// ---------------------------------------------------------------------------
// GET /api/internships
// ---------------------------------------------------------------------------
const getAllInternships = async (req, res) => {
  try {
    const { department, search, status } = req.query;
    const clauses = [];
    const params  = [];
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

    const where  = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const result = await pool.query(`SELECT * FROM internships ${where} ORDER BY posted_at DESC, created_at DESC`, params);
    return res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error("[INTERNSHIP] getAll failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve internships." });
  }
};

// ---------------------------------------------------------------------------
// GET /api/internships/:id
// ---------------------------------------------------------------------------
const getInternshipById = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM internships WHERE id = $1", [req.params.id]);
    const item   = result.rows[0];
    if (!item) return res.status(404).json({ success: false, message: "Internship not found." });
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    console.error("[INTERNSHIP] getById failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve internship details." });
  }
};

// ---------------------------------------------------------------------------
// POST /api/internships
// ---------------------------------------------------------------------------
const createInternship = async (req, res) => {
  try {
    const { title, department, description, vacancies, deadline, supervisor, duration, location } = req.body;
    if (!title || !department || !description || !deadline) {
      return res.status(400).json({ success: false, message: "Title, department, description, and deadline are required." });
    }

    const id        = `INT${String(Date.now()).slice(-6)}`;
    const posted_at = new Date().toISOString().split("T")[0];

    const result = await pool.query(
      `INSERT INTO internships (id, title, department, description, vacancies, deadline, supervisor, duration, location, status, posted_at, applicants_count, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())
       RETURNING *`,
      [
        id,
        title.trim(),
        department.trim(),
        description.trim(),
        Number(vacancies) || 1,
        deadline,
        supervisor || "HR Officer",
        duration   || "3 Months",
        location   || "City Hall – Kampala",
        "open",
        posted_at,
        0,
      ]
    );

    return res.status(201).json({ success: true, message: "Internship posting created successfully.", data: result.rows[0] });
  } catch (err) {
    console.error("[INTERNSHIP] create failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to create internship posting." });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/internships/:id
// ---------------------------------------------------------------------------
const updateInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const check  = await pool.query("SELECT id FROM internships WHERE id = $1", [id]);
    if (check.rowCount === 0) return res.status(404).json({ success: false, message: "Internship not found." });

    const allowed = ["title", "department", "description", "vacancies", "deadline", "supervisor", "duration", "location", "status"];
    const sets    = [];
    const params  = [];
    let idx = 1;

    for (const k of Object.keys(req.body)) {
      if (!allowed.includes(k)) continue;
      params.push(req.body[k]);
      sets.push(`${k} = $${idx}`);
      idx++;
    }

    if (sets.length === 0) return res.status(400).json({ success: false, message: "No valid fields to update." });

    params.push(id);
    const result = await pool.query(
      `UPDATE internships SET ${sets.join(", ")}, updated_at=NOW() WHERE id = $${idx} RETURNING *`,
      params
    );
    return res.status(200).json({ success: true, message: "Internship updated successfully.", data: result.rows[0] });
  } catch (err) {
    console.error("[INTERNSHIP] update failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to update internship posting." });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/internships/:id
// ---------------------------------------------------------------------------
const deleteInternship = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM internships WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Internship not found or already deleted." });
    }

    // Log the deletion to audit_logs in Postgres (not the JSON store)
    try {
      const actor  = req.user ? req.user.id : null;
      const reason = req.body?.reason || req.query?.reason || null;
      await pool.query(
        `INSERT INTO audit_logs (action, resource_type, resource_id, user_id, new_value, created_at)
         VALUES ($1,$2,$3,$4,$5,NOW())`,
        ["delete", "internships", id, actor, JSON.stringify({ reason })]
      );
    } catch (auditErr) {
      console.warn("[INTERNSHIP] audit log insert failed:", auditErr.message);
    }

    return res.status(200).json({ success: true, message: "Internship posting deleted successfully.", id: result.rows[0].id });
  } catch (err) {
    console.error("[INTERNSHIP] delete failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to delete internship posting." });
  }
};

module.exports = {
  getAllInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
};
