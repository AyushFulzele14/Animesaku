const express = require("express");
const order = require("../controllers/orderController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.post("/", order.createOrder);
router.get("/my", order.getMyOrders);
router.get("/track/:id", order.trackOrder);

router.get("/", authorize("admin"), order.getAllOrders);
router.patch("/:id/status", authorize("admin"), order.updateOrderStatus);

module.exports = router;
