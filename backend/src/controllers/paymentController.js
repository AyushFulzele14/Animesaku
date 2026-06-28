const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

exports.createPaymentOrder = asyncHandler(async (req, res) => {
  if (!razorpay) throw new ApiError(500, "Razorpay keys are not configured");
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  const paymentOrder = await razorpay.orders.create({
    amount: Math.round(order.totalAmount * 100),
    currency: "INR",
    receipt: `receipt_${order._id}`,
  });

  order.paymentDetails.razorpayOrderId = paymentOrder.id;
  await order.save();

  res.json({ success: true, data: paymentOrder });
});

exports.verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  const generatedSignature = crypto
    .createHmac("sha256", env.razorpay.keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    order.paymentStatus = "Failed";
    order.paymentDetails.failureReason = "Signature mismatch";
    await order.save();
    throw new ApiError(400, "Payment verification failed");
  }

  order.paymentStatus = "Paid";
  order.paymentDetails.razorpayOrderId = razorpay_order_id;
  order.paymentDetails.razorpayPaymentId = razorpay_payment_id;
  order.paymentDetails.razorpaySignature = razorpay_signature;
  await order.save();

  res.json({ success: true, message: "Payment verified successfully" });
});

exports.markPaymentFailed = asyncHandler(async (req, res) => {
  const { orderId, reason } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");
  order.paymentStatus = "Failed";
  order.paymentDetails.failureReason = reason || "Payment failed";
  await order.save();
  res.json({ success: true, message: "Failed payment captured" });
});
