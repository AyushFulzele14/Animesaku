const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

exports.createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || !cart.items.length) throw new ApiError(400, "Cart is empty");

  const orderedProducts = cart.items.map((i) => ({
    product: i.product._id,
    title: i.product.title,
    image: i.product.images?.[0]?.url || "",
    quantity: i.quantity,
    price: i.price,
  }));

  for (const item of cart.items) {
    if (item.product.stockQuantity < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${item.product.title}`);
    }
    item.product.stockQuantity -= item.quantity;
    await item.product.save();
  }

  const order = await Order.create({
    user: req.user._id,
    shippingAddress,
    orderedProducts,
    paymentMethod,
    paymentStatus: paymentMethod === "COD" ? "COD" : "Pending",
    totalAmount: cart.totalAmount,
  });

  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  res.status(201).json({ success: true, data: order });
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const data = await Order.find({ user: req.user._id }).sort("-createdAt");
  res.json({ success: true, data });
});

exports.trackOrder = asyncHandler(async (req, res) => {
  const data = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!data) throw new ApiError(404, "Order not found");
  res.json({ success: true, trackingStatus: data.trackingStatus, deliveryStatus: data.deliveryStatus });
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.deliveryStatus = req.query.status;
  if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;
  const data = await Order.find(query).populate("user", "name email").sort("-createdAt");
  res.json({ success: true, data });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const data = await Order.findByIdAndUpdate(
    req.params.id,
    { deliveryStatus: req.body.deliveryStatus, trackingStatus: req.body.trackingStatus },
    { new: true }
  );
  if (!data) throw new ApiError(404, "Order not found");
  res.json({ success: true, data });
});
