const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    title: String,
    image: String,
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    orderedProducts: [orderItemSchema],
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded", "COD"],
      default: "Pending",
      index: true,
    },
    deliveryStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
      index: true,
    },
    trackingStatus: { type: String, default: "Order placed" },
    paymentMethod: { type: String, enum: ["RAZORPAY", "COD"], required: true },
    paymentDetails: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      failureReason: String,
    },
    totalAmount: { type: Number, required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
