import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  finishType: {
    type: String,
    enum: ['matte', 'glossy'],
    default: 'matte',
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'India' },
      phoneNumber: { type: String, required: true },
    },
    paymentInfo: {
      method: {
        type: String,
        enum: ['COD', 'Razorpay'],
        required: true,
      },
      status: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending',
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
    },
    totals: {
      subtotal: { type: Number, required: true },
      shipping: { type: Number, required: true, default: 0 },
      couponDiscount: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
    },
    couponUsed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    orderStatus: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
      default: 'Processing',
      index: true,
    },
    deliveredAt: Date,
    shippedAt: Date,
    returnRequest: {
      reason: String,
      status: {
        type: String,
        enum: ['None', 'Requested', 'Approved', 'Rejected'],
        default: 'None',
      },
      requestedAt: Date,
      actionedAt: Date,
    },
    invoiceUrl: String,
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model('Order', orderSchema);
