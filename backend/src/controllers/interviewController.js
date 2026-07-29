// backend/src/controllers/interviewController.js
const db = require("../config/db");

/**
 * Retrieve interviews (with optional status/applicationId filter)
 */
const getAllInterviews = async (req, res) => {
  try {
    const { applicationId, status } = req.query;
    let items = await db.find("interviews");

    if (applicationId) {
      items = items.filter((i) => String(i.applicationId) === String(applicationId));
    }

    if (status) {
      items = items.filter((i) => i.status?.toLowerCase() === status.toLowerCase());
    }

    return res.status(200).json({ success: true, count: items.length, data: items });
  } catch (err) {
    console.error("[INTERVIEW CONTROLLER] getAll failed:", err);
    return res.status(500).json({ success: false, message: "Failed to retrieve interviews." });
  }
};

/**
 * Retrieve interview by ID
 */
const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.findById("interviews", id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Interview record not found." });
    }
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    console.error("[INTERVIEW CONTROLLER] getById failed:", err);
    return res.status(500).json({ success: false, message: "Failed to retrieve interview details." });
  }
};

/**
 * Store / Schedule a new interview (Create)
 */
const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, applicantName, internshipTitle, department, date, time, venue, meetingLink, instructions } = req.body;

    if (!applicationId || !date || !time || !venue) {
      return res.status(400).json({ success: false, message: "Application, date, time, and venue are required." });
    }

    const newInterview = await db.create("interviews", {
      id: `IVW${String(Date.now()).slice(-4)}`,
      applicationId,
      applicantName: applicantName || "Applicant",
      internshipTitle: internshipTitle || "Internship Position",
      department: department || "General",
      date,
      time,
      venue: venue.trim(),
      meetingLink: meetingLink?.trim() || null,
      instructions: instructions || "Please bring original academic documents and ID.",
      status: "scheduled",
    });

    // Update application status to 'interview'
    if (applicationId) {
      await db.update("applications", applicationId, { status: "interview" });
    }

    return res.status(201).json({
      success: true,
      message: "Interview scheduled successfully.",
      data: newInterview,
    });
  } catch (err) {
    console.error("[INTERVIEW CONTROLLER] schedule failed:", err);
    return res.status(500).json({ success: false, message: "Failed to schedule interview." });
  }
};

/**
 * Edit / Modify interview details (Update)
 */
const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.findById("interviews", id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }

    const updated = await db.update("interviews", id, req.body);
    return res.status(200).json({
      success: true,
      message: "Interview schedule updated successfully.",
      data: updated,
    });
  } catch (err) {
    console.error("[INTERVIEW CONTROLLER] update failed:", err);
    return res.status(500).json({ success: false, message: "Failed to update interview details." });
  }
};

/**
 * Delete / Cancel interview
 */
const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.delete("interviews", id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Interview record not found or already deleted." });
    }
    return res.status(200).json({ success: true, message: "Interview record deleted successfully.", id });
  } catch (err) {
    console.error("[INTERVIEW CONTROLLER] delete failed:", err);
    return res.status(500).json({ success: false, message: "Failed to delete interview record." });
  }
};

module.exports = {
  getAllInterviews,
  getInterviewById,
  scheduleInterview,
  updateInterview,
  deleteInterview,
};
