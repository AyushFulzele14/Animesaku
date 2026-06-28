const express = require("express");
const payment = require("../controllers/paymentController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(protect);

router.post("/create-order", payment.createPaymentOrder);
router.post("/verify", payment.verifyPayment);
router.post("/failed", payment.markPaymentFailed);

module.exports = router;
