// backend/src/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { requireAuth, requireRole } = require("../middleware/authJwt");

// ── RETRIEVE (all / filtered) ─────────────────────────────────────────────
// GET /api/users?role=applicant&status=active&search=sarah
router.get("/", getAllUsers);

// ── RETRIEVE BY ID ─────────────────────────────────────────────────────────
// GET /api/users/:id
router.get("/:id", getUserById);

// ── WRITE / STORE (create) ─────────────────────────────────────────────────
// POST /api/users  { name, email, password, role, phone, title, department }
router.post("/", requireAuth, requireRole(["admin"]), createUser);

// ── EDIT / MODIFY (update) ─────────────────────────────────────────────────
// PUT /api/users/:id  { any updatable fields }
router.put("/:id", requireAuth, requireRole(["admin"]), updateUser);

// ── DELETE ─────────────────────────────────────────────────────────────────
// DELETE /api/users/:id
router.delete("/:id", requireAuth, requireRole(["admin"]), deleteUser);

module.exports = router;
