const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  cancelOrder,
  deleteOrder
} = require("../controllers/orderController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getOrders);
router.get("/:id", getOrder);
router.post("/", createOrder);
router.patch("/:id/cancel", cancelOrder);
router.put("/:id", requireAdmin, updateOrder);
router.delete("/:id", requireAdmin, deleteOrder);

module.exports = router;
