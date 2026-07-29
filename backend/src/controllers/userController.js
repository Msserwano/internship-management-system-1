// backend/src/controllers/userController.js
const db = require("../config/db");
const bcrypt = require("bcryptjs");

/**
 * Retrieve all users (with optional role/status filters)
 */
const getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let items = await db.find("users");

    if (role && role !== "all") {
      items = items.filter((u) => u.role?.toLowerCase() === role.toLowerCase());
    }

    if (status && status !== "all") {
      items = items.filter((u) => u.status?.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q)
      );
    }

    // Strip password hashes from user objects
    const safeItems = items.map(({ password, passwordHash, ...user }) => user);

    return res.status(200).json({ success: true, count: safeItems.length, data: safeItems });
  } catch (err) {
    console.error("[USER CONTROLLER] getAll failed:", err);
    return res.status(500).json({ success: false, message: "Failed to retrieve users." });
  }
};

/**
 * Retrieve single user by ID or Email
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    let user = await db.findById("users", id);
    if (!user) {
      // Try by email
      const users = await db.find("users", (u) => u.email?.toLowerCase() === id.toLowerCase());
      user = users[0];
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const { password, passwordHash, ...safeUser } = user;
    return res.status(200).json({ success: true, data: safeUser });
  } catch (err) {
    console.error("[USER CONTROLLER] getById failed:", err);
    return res.status(500).json({ success: false, message: "Failed to retrieve user details." });
  }
};

/**
 * Store / Write a new user (Create)
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, title, department } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "Name, email, password, and role are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await db.find("users", (u) => u.email?.toLowerCase() === normalizedEmail);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "A user with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const nameParts = name.trim().split(" ");

    const newUser = await db.create("users", {
      id: `U${String(Date.now()).slice(-4)}`,
      name: name.trim(),
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(" ") || "",
      email: normalizedEmail,
      passwordHash,
      role,
      phone: phone || "",
      title: title || "",
      department: department || "",
      status: "active",
      isVerified: true,
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: safeUser,
    });
  } catch (err) {
    console.error("[USER CONTROLLER] create failed:", err);
    return res.status(500).json({ success: false, message: "Failed to create user." });
  }
};

/**
 * Edit / Modify user details or role/status (Update)
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.findById("users", id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const updates = { ...req.body };
    if (updates.password) {
      updates.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

    const updated = await db.update("users", id, updates);
    const { password, passwordHash, ...safeUser } = updated;

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: safeUser,
    });
  } catch (err) {
    console.error("[USER CONTROLLER] update failed:", err);
    return res.status(500).json({ success: false, message: "Failed to update user." });
  }
};

/**
 * Delete user
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.delete("users", id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "User not found or already deleted." });
    }
    return res.status(200).json({ success: true, message: "User deleted successfully.", id });
  } catch (err) {
    console.error("[USER CONTROLLER] delete failed:", err);
    return res.status(500).json({ success: false, message: "Failed to delete user." });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
