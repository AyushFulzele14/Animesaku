import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  forgotPassword,
  verifyOtp,
  resetPassword,
  googleLogin,
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  deleteAddress,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { upload } from '../middlewares/multer.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  addressSchema,
} from '../utils/validators.js';

const router = Router();

// Public Auth Endpoints
router.post('/signup', authLimiter, validate(registerSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);
router.post('/logout', logoutUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/google-login', googleLogin);

// Protected Profile & Address Endpoints
router.get('/me', protect, getProfile);
router.patch('/profile', protect, upload.single('avatar'), updateProfile);

router.route('/address')
  .get(protect, getAddresses)
  .post(protect, validate(addressSchema), addAddress);

router.delete('/address/:id', protect, deleteAddress);

export default router;
