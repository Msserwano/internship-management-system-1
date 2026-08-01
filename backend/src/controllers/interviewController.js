
const { getPool } = require("../config/database");
const isStaff = (user) => ["hr", "admin"].includes(String(user?.role).toLowerCase());

// Shared SELECT with joins to return applicant and internship context
const interviewSelect = `
  SELECT
    iv.*,
    iv.application_id      AS "applicationId",
    iv.interview_date      AS "interviewDate",
    iv.interview_time      AS "interviewTime",
    iv.meeting_link        AS "meetingLink",
    iv.panel_members       AS "panelMembers",
    a.applicant_id         AS "applicantId",
    a.internship_id        AS "internshipId",
    COALESCE(appl.full_name, u.name, 'Applicant') AS "applicantName",
    i.title                AS "internshipTitle",
    COALESCE(i.department, 'General') AS department
  FROM interviews iv
  JOIN applications a      ON a.id = iv.application_id
  LEFT JOIN applicants appl ON appl.applicant_id::text = a.applicant_id
  LEFT JOIN users u         ON u.id::text = a.applicant_id
  LEFT JOIN internships i   ON i.id = a.internship_id`;


const getAllInterviews = async (req, res) => {
  try {
    const pool = getPool();
    // Ensure panel_members/instructions columns exist (migration-safe)
    await pool.query("ALTER TABLE interviews ADD COLUMN IF NOT EXISTS panel_members TEXT[]");
    await pool.query("ALTER TABLE interviews ADD COLUMN IF NOT EXISTS instructions TEXT");

    const { applicationId, status } = req.query;
    const clauses = [];
    const params = [];
    let idx = 1;

    if (applicationId) {
      clauses.push(`iv.application_id = $${idx}`);
      params.push(applicationId);
      idx++;
    }
    if (status) {
      clauses.push(`LOWER(iv.status) = $${idx}`);
      params.push(status.toLowerCase());
      idx++;
    }
    // Applicants can only see interviews for their own applications
    if (!isStaff(req.user)) {
      clauses.push(`a.applicant_id = $${idx}`);
      params.push(req.user.id);
      idx++;
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const q = `${interviewSelect} ${where} ORDER BY iv.interview_date DESC`;
    const result = await pool.query(q, params);
    return res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error("[INTERVIEW CONTROLLER] getAll failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve interviews." });
  }
};


const getInterviewById = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const where = isStaff(req.user) ? "WHERE iv.id = $1" : "WHERE iv.id = $1 AND a.applicant_id = $2";
    const params = isStaff(req.user) ? [id] : [id, req.user.id];
    const result = await pool.query(`${interviewSelect} ${where}`, params);
    const item = result.rows[0];
    if (!item) return res.status(404).json({ success: false, message: "Interview record not found." });
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    console.error("[INTERVIEW CONTROLLER] getById failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve interview details." });
  }
};


const scheduleInterview = async (req, res) => {
  try {
    const pool = getPool();
    const { applicationId, date, time, venue, meetingLink, instructions, panelMembers } = req.body;
    if (!applicationId || !date || !time || !venue) {
      return res.status(400).json({ success: false, message: "Application, date, time, and venue are required." });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Ensure panel_members and instructions columns exist
      await client.query("ALTER TABLE interviews ADD COLUMN IF NOT EXISTS panel_members TEXT[]");
      await client.query("ALTER TABLE interviews ADD COLUMN IF NOT EXISTS instructions TEXT");

      const id = `IVW${String(Date.now()).slice(-6)}`;
      const panelArr = Array.isArray(panelMembers)
        ? panelMembers
        : panelMembers ? String(panelMembers).split(",").map(s => s.trim()) : [];

      const result = await client.query(
        `INSERT INTO interviews
           (id, application_id, interview_date, interview_time, venue, meeting_link, panel_members, instructions, status, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'scheduled',NOW())
         RETURNING *`,
        [id, applicationId, date, time, venue.trim(), meetingLink || null, panelArr, instructions || null]
      );

      // Update application status to 'interview'
      await client.query(
        "UPDATE applications SET status = 'interview', updated_at=NOW() WHERE id = $1",
        [applicationId]
      );

      await client.query("COMMIT");
      client.release();

      // Return the interview with joined data
      const fullResult = await pool.query(`${interviewSelect} WHERE iv.id = $1`, [id]);
      return res.status(201).json({ success: true, message: "Interview scheduled successfully.", data: fullResult.rows[0] });
    } catch (err) {
      await client.query("ROLLBACK");
      client.release();
      throw err;
    }
  } catch (err) {
    console.error("[INTERVIEW CONTROLLER] schedule failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to schedule interview." });
  }
};


const updateInterview = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const check = await pool.query(
      "SELECT iv.id, a.applicant_id FROM interviews iv JOIN applications a ON a.id = iv.application_id WHERE iv.id = $1",
      [id]
    );
    if (check.rowCount === 0) return res.status(404).json({ success: false, message: "Interview not found." });

    const updates = req.body;
    const isApplicant = !isStaff(req.user);

    if (
      isApplicant &&
      (String(check.rows[0].applicant_id) !== String(req.user.id) ||
        !["accepted", "declined"].includes(updates.status) ||
        Object.keys(updates).some(k => k !== "status"))
    ) {
      return res.status(403).json({ success: false, message: "Applicants may only accept or decline their own interview." });
    }

    const fieldMap = {
      interviewDate: "interview_date",
      interview_date: "interview_date",
      interviewTime: "interview_time",
      interview_time: "interview_time",
      meetingLink: "meeting_link",
      meeting_link: "meeting_link",
      panelMembers: "panel_members",
      panel_members: "panel_members",
      instructions: "instructions",
      venue: "venue",
      status: "status",
    };
    const sets = [];
    const params = [];
    let idx = 1;
    for (const [k, val] of Object.entries(updates)) {
      const col = fieldMap[k];
      if (!col) continue;
      params.push(col === "panel_members" && Array.isArray(val) ? val : val);
      sets.push(`${col} = $${idx}`);
      idx++;
    }
    if (sets.length === 0) return res.status(400).json({ success: false, message: "No valid fields to update." });

    params.push(id);
    const result = await pool.query(
      `UPDATE interviews SET ${sets.join(", ")}, updated_at=NOW() WHERE id = $${idx} RETURNING *`,
      params
    );

    // If applicant accepted or declined, notify HR staff asynchronously
    if (isApplicant && ["accepted", "declined"].includes(updates.status)) {
      (async () => {
        try {
          const hrRes = await pool.query("SELECT id FROM users WHERE LOWER(role) IN ('hr','admin') AND (status IS NULL OR LOWER(status)='active')");
          for (const hr of hrRes.rows) {
            await pool.query(
              `INSERT INTO notifications (user_id, type, payload, is_read, created_at) VALUES ($1,$2,$3,false,NOW())`,
              [
                hr.id,
                `interview_${updates.status}`,
                JSON.stringify({
                  interviewId: id,
                  applicantName: req.user.name,
                  status: updates.status,
                  message: `${req.user.name} has ${updates.status} the interview invitation.`
                })
              ]
            );
          }
        } catch (e) {
          console.warn("[INTERVIEW] HR notification error:", e.message);
        }
      })();
    }

    return res.status(200).json({ success: true, message: `Interview ${updates.status || 'updated'} successfully.`, data: result.rows[0] });
  } catch (err) {
    console.error("[INTERVIEW CONTROLLER] update failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to update interview details." });
  }
};


const deleteInterview = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const result = await pool.query("DELETE FROM interviews WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: "Interview record not found or already deleted." });
    return res.status(200).json({ success: true, message: "Interview record deleted successfully.", id: result.rows[0].id });
  } catch (err) {
    console.error("[INTERVIEW CONTROLLER] delete failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to delete interview record." });
  }
};

module.exports = { getAllInterviews, getInterviewById, scheduleInterview, updateInterview, deleteInterview };
