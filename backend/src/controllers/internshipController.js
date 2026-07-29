// backend/src/controllers/internshipController.js
const db = require("../config/db");

/**
 * Retrieve all internships (with optional query filter e.g. ?department=ICT&search=software)
 */
const getAllInternships = async (req, res) => {
  try {
    const { department, search, status } = req.query;
    let items = await db.find("internships");

    if (department && department !== "all") {
      items = items.filter((i) => i.department?.toLowerCase() === department.toLowerCase());
    }

    if (status) {
      items = items.filter((i) => i.status?.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.department?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({ success: true, count: items.length, data: items });
  } catch (err) {
    console.error("[INTERNSHIP CONTROLLER] getAll failed:", err);
    return res.status(500).json({ success: false, message: "Failed to retrieve internships." });
  }
};

/**
 * Retrieve a single internship by ID
 */
const getInternshipById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.findById("internships", id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Internship not found." });
    }
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    console.error("[INTERNSHIP CONTROLLER] getById failed:", err);
    return res.status(500).json({ success: false, message: "Failed to retrieve internship details." });
  }
};

/**
 * Store / Write a new internship posting (Create)
 */
const createInternship = async (req, res) => {
  try {
    const { title, department, description, vacancies, deadline, supervisor, duration, location } = req.body;

    if (!title || !department || !description || !deadline) {
      return res.status(400).json({ success: false, message: "Title, department, description, and deadline are required." });
    }

    const newPosting = await db.create("internships", {
      id: `INT${String(Date.now()).slice(-4)}`,
      title: title.trim(),
      department: department.trim(),
      description: description.trim(),
      vacancies: Number(vacancies) || 1,
      deadline,
      supervisor: supervisor?.trim() || "HR Officer",
      duration: duration || "3 Months",
      location: location || "City Hall – Kampala",
      status: "open",
      posted: new Date().toISOString().split("T")[0],
      applicantsCount: 0,
    });

    return res.status(201).json({
      success: true,
      message: "Internship posting created successfully.",
      data: newPosting,
    });
  } catch (err) {
    console.error("[INTERNSHIP CONTROLLER] create failed:", err);
    return res.status(500).json({ success: false, message: "Failed to create internship posting." });
  }
};

/**
 * Edit / Modify internship details (Update)
 */
const updateInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.findById("internships", id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Internship not found." });
    }

    const updated = await db.update("internships", id, req.body);
    return res.status(200).json({
      success: true,
      message: "Internship updated successfully.",
      data: updated,
    });
  } catch (err) {
    console.error("[INTERNSHIP CONTROLLER] update failed:", err);
    return res.status(500).json({ success: false, message: "Failed to update internship posting." });
  }
};

/**
 * Delete internship posting
 */
const deleteInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.delete("internships", id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Internship not found or already deleted." });
    }
    return res.status(200).json({ success: true, message: "Internship posting deleted successfully.", id });
  } catch (err) {
    console.error("[INTERNSHIP CONTROLLER] delete failed:", err);
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
