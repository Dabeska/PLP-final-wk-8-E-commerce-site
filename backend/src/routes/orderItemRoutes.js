const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const {
  getOrderItems,
  getOrderItem,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem
} = require("../controllers/orderItemController");

const router = express.Router();

router.use(authMiddleware, requireAdmin);

router.get("/", getOrderItems);
router.get("/:id", getOrderItem);
router.post("/", createOrderItem);
router.put("/:id", updateOrderItem);
router.delete("/:id", deleteOrderItem);

module.exports = router;
