// backend/src/controllers/applicationController.js
const db = require("../config/db");

/**
 * Retrieve applications (with applicantId, internshipId, status filters)
 */
const getAllApplications = async (req, res) => {
  try {
    const { applicantId, internshipId, status } = req.query;
    let items = await db.find("applications");

    if (applicantId) {
      items = items.filter((a) => String(a.applicantId) === String(applicantId));
    }

    if (internshipId) {
      items = items.filter((a) => String(a.internshipId) === String(internshipId));
    }

    if (status) {
      items = items.filter((a) => a.status?.toLowerCase() === status.toLowerCase());
    }

    return res.status(200).json({ success: true, count: items.length, data: items });
  } catch (err) {
    console.error("[APPLICATION CONTROLLER] getAll failed:", err);
    return res.status(500).json({ success: false, message: "Failed to retrieve applications." });
  }
};

/**
 * Retrieve single application by ID
 */
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.findById("applications", id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    console.error("[APPLICATION CONTROLLER] getById failed:", err);
    return res.status(500).json({ success: false, message: "Failed to retrieve application." });
  }
};

/**
 * Store / Write a new application (Create)
 */
const submitApplication = async (req, res) => {
  try {
    const { internshipId, applicantId, applicantName, university, course, gpa } = req.body;

    if (!internshipId || !university || !course) {
      return res.status(400).json({ success: false, message: "Internship, university, and course are required." });
    }

    // Lookup internship title
    const internship = await db.findById("internships", internshipId);

    const newApp = await db.create("applications", {
      id: `APP${String(Date.now()).slice(-4)}`,
      internshipId,
      internshipTitle: internship?.title || "Internship Position",
      department: internship?.department || "General",
      applicantId: applicantId || "U001",
      applicantName: applicantName || "Sarah Nakimuli",
      university,
      course,
      gpa: gpa || "3.5",
      status: "submitted",
      submittedAt: new Date().toISOString(),
      timeline: [
        { status: "submitted", date: new Date().toISOString(), note: "Application submitted successfully." }
      ]
    });

    // Update internship applicant count if internship exists
    if (internship) {
      await db.update("internships", internshipId, {
        applicantsCount: (internship.applicantsCount || 0) + 1,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      data: newApp,
    });
  } catch (err) {
    console.error("[APPLICATION CONTROLLER] submit failed:", err);
    return res.status(500).json({ success: false, message: "Failed to submit application." });
  }
};

/**
 * Edit / Modify application status or review notes (Update)
 */
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.findById("applications", id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    const { status, reviewNote } = req.body;
    const updates = { ...req.body };

    if (status && status !== existing.status) {
      const timeline = existing.timeline || [];
      timeline.push({
        status,
        date: new Date().toISOString(),
        note: reviewNote || `Status updated to ${status}.`,
      });
      updates.timeline = timeline;
    }

    const updated = await db.update("applications", id, updates);
    return res.status(200).json({
      success: true,
      message: "Application updated successfully.",
      data: updated,
    });
  } catch (err) {
    console.error("[APPLICATION CONTROLLER] update failed:", err);
    return res.status(500).json({ success: false, message: "Failed to update application." });
  }
};

/**
 * Delete application
 */
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.delete("applications", id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Application not found or already deleted." });
    }
    return res.status(200).json({ success: true, message: "Application deleted successfully.", id });
  } catch (err) {
    console.error("[APPLICATION CONTROLLER] delete failed:", err);
    return res.status(500).json({ success: false, message: "Failed to delete application." });
  }
};

module.exports = {
  getAllApplications,
  getApplicationById,
  submitApplication,
  updateApplication,
  deleteApplication,
};
