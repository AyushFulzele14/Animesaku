import { Coupon } from '../models/Coupon.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Validate coupon code for checkout
 */
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartAmount } = req.body;

  if (!code) {
    throw new ApiError(400, 'Coupon code is required');
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon) {
    throw new ApiError(400, 'Invalid or inactive coupon code');
  }

  if (coupon.isExpired()) {
    throw new ApiError(400, 'This coupon code has expired');
  }

  if (Number(cartAmount) < coupon.minOrderAmount) {
    throw new ApiError(400, `Minimum purchase amount of ₹${coupon.minOrderAmount} required for this coupon`);
  }

  // Calculate discount value
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (Number(cartAmount) * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount > 0 && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    discount = coupon.discountValue;
  }

  // Cap discount at cartAmount
  if (discount > Number(cartAmount)) {
    discount = Number(cartAmount);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        couponId: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
      },
      'Coupon code applied successfully'
    )
  );
});

/**
 * Get All Coupons (Admin view or generic user list)
 */
export const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  return res.status(200).json(new ApiResponse(200, coupons, 'Coupons retrieved successfully'));
});
