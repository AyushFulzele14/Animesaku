import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'admin']).optional().default('customer'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  code: z.string().length(6, 'OTP must be exactly 6 characters'),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  code: z.string().length(6, 'OTP must be exactly 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

const formNumber = (val, fallback = 0) => {
  if (val === undefined || val === null || val === '') return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? n : NaN;
};

export const productSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  animeName: z.string().trim().min(2, 'Anime name is required'),
  category: z
    .string()
    .trim()
    .min(1, 'Category is required')
    .regex(/^[0-9a-fA-F]{24}$/, 'Select a valid category'),
  type: z.enum(['poster', 'sticker']),
  price: z.preprocess(
    (val) => formNumber(val),
    z.number({ invalid_type_error: 'Price must be a number' }).min(0, 'Price cannot be negative')
  ),
  discountPrice: z.preprocess(
    (val) => formNumber(val, 0),
    z.number().min(0).optional()
  ),
  stockQuantity: z.preprocess(
    (val) => formNumber(val),
    z.number({ invalid_type_error: 'Stock must be a number' }).int().min(0, 'Stock cannot be negative')
  ),
  dimensions: z.string().trim().min(2, 'Dimensions are required'),
  materialQuality: z.string().trim().min(2, 'Material quality details required'),
  finishType: z
    .preprocess((val) => (val === '' || val === undefined ? 'matte' : val), z.enum(['matte', 'glossy', 'both']))
    .default('matte'),
  featured: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  trending: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  newArrival: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().trim().min(3, 'Comment must be at least 3 characters'),
});

export const addressSchema = z.object({
  street: z.string().trim().min(5, 'Street address is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  zipCode: z.string().trim().min(4, 'ZIP/Postal code is required'),
  country: z.string().trim().default('India'),
  phoneNumber: z.string().trim().min(10, 'Phone number must be at least 10 digits'),
  isDefault: z.boolean().optional().default(false),
});

export const orderSchema = z.object({
  shippingAddress: z.object({
    street: z.string().trim().min(5, 'Street address is required'),
    city: z.string().trim().min(2, 'City is required'),
    state: z.string().trim().min(2, 'State is required'),
    zipCode: z.string().trim().min(4, 'ZIP/Postal code is required'),
    country: z.string().trim().default('India'),
    phoneNumber: z.string().trim().min(10, 'Phone number must be at least 10 digits'),
  }),
  paymentMethod: z.enum(['COD', 'Razorpay']),
  couponCode: z.string().trim().toUpperCase().optional(),
});

export const couponSchema = z.object({
  code: z.string().trim().toUpperCase().min(3, 'Coupon code must be at least 3 characters'),
  discountType: z.enum(['percentage', 'flat']),
  discountValue: z.number().min(0, 'Discount value cannot be negative'),
  maxDiscountAmount: z.number().min(0).optional().default(0),
  minOrderAmount: z.number().min(0).optional().default(0),
  expiryDate: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
  }, z.date().refine((date) => date > new Date(), { message: 'Expiry date must be in the future' })),
  isActive: z.boolean().optional().default(true),
});
