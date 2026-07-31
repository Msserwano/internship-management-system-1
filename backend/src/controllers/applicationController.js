
const { getPool } = require("../config/database");
const { sendNotificationEmail } = require("../config/mailer");

const isStaff = (user) => ["hr", "admin"].includes(String(user?.role).toLowerCase());

// Lazy getter — prevents crash on import when DB is not yet ready
const pool = () => getPool();

// Shared SELECT that joins internship title, applicant name, and assigned HR name
const applicationSelect = `
  SELECT
    a.*,
    a.internship_id   AS "internshipId",
    a.applicant_id    AS "applicantId",
    a.submitted_at    AS "submittedAt",
    a.review_note     AS "reviewNote",
    a.assigned_hr_id  AS "assignedHrId",
    i.title           AS "internshipTitle",
    COALESCE(i.department, 'General') AS department,
    COALESCE(u.name, app.full_name, 'Applicant') AS "applicantName",
    COALESCE(u.email, app.email) AS "applicantEmail",
    ur.name           AS "assignedHrName"
  FROM applications a
  LEFT JOIN internships i  ON i.id  = a.internship_id
  LEFT JOIN users u        ON u.id  = a.applicant_id
  LEFT JOIN applicants app ON app.applicant_id::text = a.applicant_id
  LEFT JOIN users ur       ON ur.id = a.assigned_hr_id`;

// ---------------------------------------------------------------------------
// GET /api/applications
// ---------------------------------------------------------------------------
const getAllApplications = async (req, res) => {
  try {
    const { applicantId, internshipId, status } = req.query;
    const clauses = [];
    const params  = [];
    let idx = 1;

    // Non-staff users can only see their own applications
    const effectiveApplicantId = isStaff(req.user) ? applicantId : req.user.id;
    if (effectiveApplicantId) {
      clauses.push(`a.applicant_id = $${idx}`);
      params.push(effectiveApplicantId);
      idx++;
    }
    if (internshipId) {
      clauses.push(`a.internship_id = $${idx}`);
      params.push(internshipId);
      idx++;
    }
    if (status) {
      clauses.push(`LOWER(a.status) = $${idx}`);
      params.push(status.toLowerCase());
      idx++;
    }

    const where  = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const result = await pool().query(`${applicationSelect} ${where} ORDER BY a.submitted_at DESC`, params);
    return res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error("[APPLICATION] getAll failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve applications." });
  }
};

// ---------------------------------------------------------------------------
// GET /api/applications/:id
// ---------------------------------------------------------------------------
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const query  = isStaff(req.user)
      ? `${applicationSelect} WHERE a.id = $1`
      : `${applicationSelect} WHERE a.id = $1 AND a.applicant_id = $2`;
    const result = await pool().query(query, isStaff(req.user) ? [id] : [id, req.user.id]);
    const item   = result.rows[0];
    if (!item) return res.status(404).json({ success: false, message: "Application not found." });
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    console.error("[APPLICATION] getById failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve application." });
  }
};

// ---------------------------------------------------------------------------
// POST /api/applications  — requireAuth is enforced on the route
// ---------------------------------------------------------------------------
const submitApplication = async (req, res) => {
  try {
    const { internshipId, university, course, gpa } = req.body;

    if (!internshipId || !university || !course) {
      return res.status(400).json({ success: false, message: "Internship, university, and course are required." });
    }

    // At this point req.user is guaranteed by requireAuth middleware
    const applicantId = req.user.id;

    const client = await pool().connect();
    try {
      // Ensure timeline column exists (safe in all environments)
      await client.query("ALTER TABLE applications ADD COLUMN IF NOT EXISTS timeline JSONB");
      await client.query("BEGIN");

      const internshipRes = await client.query("SELECT * FROM internships WHERE id = $1 FOR UPDATE", [internshipId]);
      const internship    = internshipRes.rows[0];

      if (!internship || internship.status !== "open" || new Date(internship.deadline) < new Date()) {
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, message: "This internship is not accepting applications." });
      }

      // Prevent duplicate application by the same user for the same internship
      const dupCheck = await client.query(
        "SELECT id FROM applications WHERE internship_id = $1 AND applicant_id = $2",
        [internshipId, applicantId]
      );
      if (dupCheck.rowCount > 0) {
        await client.query("ROLLBACK");
        return res.status(409).json({ success: false, message: "You have already applied for this internship." });
      }

      const id       = `APP${String(Date.now()).slice(-6)}`;
      const timeline = [{ status: "submitted", date: new Date().toISOString(), note: "Application submitted successfully." }];

      const appRes = await client.query(
        `INSERT INTO applications (id, internship_id, applicant_id, university, course, gpa, status, review_note, submitted_at, timeline)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING *`,
        [id, internshipId, applicantId, university, course, gpa || null, "submitted", null, new Date().toISOString(), JSON.stringify(timeline)]
      );

      await client.query(
        "UPDATE internships SET applicants_count = COALESCE(applicants_count,0) + 1, updated_at=NOW() WHERE id = $1",
        [internshipId]
      );

      await client.query("COMMIT");

      // Notify HR staff asynchronously (fire-and-forget — don't block the response)
      (async () => {
        try {
          const hrRes = await pool().query("SELECT id, email, name FROM users WHERE LOWER(role)='hr' AND (status IS NULL OR LOWER(status)='active')");
          if (hrRes.rowCount > 0) {
            const app = appRes.rows[0];
            const subject = `New application submitted for ${internship.title}`;
            const viewLink = process.env.FRONTEND_URL
              ? `${process.env.FRONTEND_URL.replace(/\/$/, "")}/hr/applications`
              : "";
            const html = `
              <p>A new application has been submitted for <strong>${internship.title}</strong>.</p>
              <p><strong>Applicant:</strong> ${req.user.name}</p>
              <p><strong>University:</strong> ${university}</p>
              <p><strong>Course:</strong> ${course}</p>
              <p><strong>GPA:</strong> ${gpa || "N/A"}</p>
              ${viewLink ? `<p><a href="${viewLink}">Review application</a></p>` : ""}
            `;

            for (const hr of hrRes.rows) {
              try {
                await pool().query(
                  `INSERT INTO notifications (user_id, type, payload, is_read, created_at) VALUES ($1,$2,$3,false,NOW())`,
                  [hr.id, "application_submitted", JSON.stringify({ applicationId: app.id, internshipId, applicantId })]
                );
              } catch (e) {
                console.warn("[NOTIFY] DB notification insert failed:", e.message);
              }
              try {
                await sendNotificationEmail(hr.email, subject, html, `New application for ${internship.title}`);
              } catch (e) {
                console.warn("[NOTIFY] Email send failed to", hr.email, ":", e.message);
              }
            }
          }
        } catch (notifyErr) {
          console.warn("[APPLICATION] HR notification async error:", notifyErr.message);
        }
      })();

      return res.status(201).json({ success: true, message: "Application submitted successfully.", data: appRes.rows[0] });
    } catch (innerErr) {
      await client.query("ROLLBACK");
      throw innerErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[APPLICATION] submit failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to submit application." });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/applications/:id
// ---------------------------------------------------------------------------
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool().connect();
    try {
      await client.query("ALTER TABLE applications ADD COLUMN IF NOT EXISTS timeline JSONB");

      const existing = (await client.query("SELECT * FROM applications WHERE id = $1", [id])).rows[0];
      if (!existing) return res.status(404).json({ success: false, message: "Application not found." });

      // Applicants may only withdraw their own application
      if (!isStaff(req.user)) {
        const isOwner      = String(existing.applicant_id) === String(req.user.id);
        const isWithdrawal = req.body.status === "withdrawn";
        if (!isOwner || !isWithdrawal) {
          return res.status(403).json({ success: false, message: "Applicants may only withdraw their own application." });
        }
      }

      const { status, reviewNote, review_note } = req.body;
      const note    = reviewNote || review_note || null;
      let timeline  = existing.timeline || [];

      if (status && status !== existing.status) {
        timeline = timeline.concat([{
          status,
          date: new Date().toISOString(),
          note: note || `Status updated to ${status}.`,
        }]);
      }

      const allowed = ["status", "review_note", "timeline"];
      const sets    = [];
      const params  = [];
      let idx = 1;

      const updates = { ...req.body, timeline, review_note: note };

      for (const k of Object.keys(updates)) {
        const col = k === "reviewNote" ? "review_note" : k;
        if (!allowed.includes(col)) continue;
        params.push(col === "timeline" ? JSON.stringify(updates[k]) : updates[k]);
        sets.push(`${col} = $${idx}`);
        idx++;
      }

      if (sets.length === 0) return res.status(400).json({ success: false, message: "No valid fields to update." });

      params.push(id);
      const result = await client.query(
        `UPDATE applications SET ${sets.join(", ")}, updated_at=NOW() WHERE id = $${idx} RETURNING *`,
        params
      );
      return res.status(200).json({ success: true, message: "Application updated successfully.", data: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[APPLICATION] update failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to update application." });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/applications/:id
// ---------------------------------------------------------------------------
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool().query("DELETE FROM applications WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Application not found or already deleted." });
    }
    return res.status(200).json({ success: true, message: "Application deleted successfully.", id: result.rows[0].id });
  } catch (err) {
    console.error("[APPLICATION] delete failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to delete application." });
  }
};

// ---------------------------------------------------------------------------
// POST /api/applications/:id/assign
// ---------------------------------------------------------------------------
const assignApplication = async (req, res) => {
  try {
    const { id }   = req.params;
    const { hrId } = req.body;
    if (!hrId) return res.status(400).json({ success: false, message: "hrId is required." });

    const client = await pool().connect();
    try {
      await client.query("BEGIN");

      const application = (await client.query("SELECT * FROM applications WHERE id = $1 FOR UPDATE", [id])).rows[0];
      if (!application) {
        await client.query("ROLLBACK");
        return res.status(404).json({ success: false, message: "Application not found." });
      }

      const hrUser = (await client.query("SELECT id, email, name, role FROM users WHERE id = $1", [hrId])).rows[0];
      if (!hrUser || String(hrUser.role).toLowerCase() !== "hr") {
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, message: "Provided hrId does not belong to a valid HR user." });
      }

      const timeline = (application.timeline || []).concat([{
        status: "assigned",
        date:   new Date().toISOString(),
        note:   `Assigned to HR ${hrUser.name || hrUser.id}`,
      }]);

      const updated = await client.query(
        `UPDATE applications SET assigned_hr_id=$1, timeline=$2, updated_at=NOW() WHERE id=$3 RETURNING *`,
        [hrId, JSON.stringify(timeline), id]
      );

      try {
        await client.query(
          `INSERT INTO notifications (user_id, type, payload, is_read, created_at) VALUES ($1,$2,$3,false,NOW())`,
          [hrId, "application_assigned", JSON.stringify({ applicationId: id, internshipId: application.internship_id, applicantId: application.applicant_id })]
        );
      } catch (notifErr) {
        console.warn("[APPLICATION] notification insert warning:", notifErr.message);
      }

      await client.query("COMMIT");

      // Notify assigned HR by email (async)
      (async () => {
        try {
          const link = process.env.FRONTEND_URL
            ? `${process.env.FRONTEND_URL.replace(/\/$/, "")}/hr/applications`
            : "";
          await sendNotificationEmail(
            hrUser.email,
            `Application ${id} assigned to you`,
            `<p>Application <strong>${id}</strong> has been assigned to you.</p>${link ? `<p><a href="${link}">Review it here</a></p>` : ""}`,
            `Application ${id} assigned to you`
          );
        } catch (e) {
          console.warn("[NOTIFY] Email to assigned HR failed:", e.message);
        }
      })();

      return res.status(200).json({ success: true, message: "Application assigned successfully.", data: updated.rows[0] });
    } catch (innerErr) {
      await client.query("ROLLBACK");
      throw innerErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[APPLICATION] assign failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to assign application." });
  }
};

module.exports = {
  getAllApplications,
  getApplicationById,
  submitApplication,
  updateApplication,
  deleteApplication,
  assignApplication,
};
