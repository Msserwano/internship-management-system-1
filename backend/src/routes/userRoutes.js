
const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { requireAuth, requireRole, requireSelfOrRole } = require("../middleware/authJwt");



router.get("/", requireAuth, requireRole(["hr", "admin"]), getAllUsers);



router.get("/:id", requireAuth, requireSelfOrRole(), getUserById);



router.post("/", requireAuth, requireRole(["admin"]), createUser);



router.put("/:id", requireAuth, requireRole(["admin"]), updateUser);



router.delete("/:id", requireAuth, requireRole(["admin"]), deleteUser);

module.exports = router;
