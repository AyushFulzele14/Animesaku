import { Router } from 'express';
import { validateCoupon, getAllCoupons } from '../controllers/couponController.js';
import { createCoupon, deleteCoupon } from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { couponSchema } from '../utils/validators.js';

const router = Router();

// Public / Customer validation route
router.post('/validate', protect, validateCoupon);

// Admin-Only Coupon Management routes
router.route('/')
  .get(protect, authorize('admin'), getAllCoupons)
  .post(protect, authorize('admin'), validate(couponSchema), createCoupon);

router.delete('/:id', protect, authorize('admin'), deleteCoupon);

export default router;
