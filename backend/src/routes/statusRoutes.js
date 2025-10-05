const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const {
  getStatuses,
  getStatus,
  createStatus,
  updateStatus,
  deleteStatus
} = require("../controllers/statusController");

const router = express.Router();

router.get("/", getStatuses);
router.get("/:id", getStatus);
router.post("/", authMiddleware, requireAdmin, createStatus);
router.put("/:id", authMiddleware, requireAdmin, updateStatus);
router.delete("/:id", authMiddleware, requireAdmin, deleteStatus);

module.exports = router;
