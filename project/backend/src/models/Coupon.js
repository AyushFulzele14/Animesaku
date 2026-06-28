import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: [true, 'Discount type (percentage or flat) is required'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    maxDiscountAmount: {
      type: Number, // Applicable for percentage coupons
      default: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Check if coupon is expired
couponSchema.methods.isExpired = function () {
  return this.expiryDate < new Date();
};

export const Coupon = mongoose.model('Coupon', couponSchema);
