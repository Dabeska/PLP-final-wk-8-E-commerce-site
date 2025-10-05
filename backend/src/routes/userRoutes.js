const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require("../controllers/userController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", requireAdmin, getUsers);
router.get("/:id", getUserById);
router.post("/", requireAdmin, createUser);
router.put("/:id", updateUser);
router.delete("/:id", requireAdmin, deleteUser);

module.exports = router;
