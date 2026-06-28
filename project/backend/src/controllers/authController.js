import { User } from '../models/User.js';
import { Cart } from '../models/Cart.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOtpEmail } from '../services/mailService.js';
import jwt from 'jsonwebtoken';

/**
 * Format user for API responses to match frontend useAuth expectations
 */
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: {
    public_id: user.avatar?.public_id || '',
    url: user.avatar?.url || '',
  },
});

/**
 * Register User
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, password } = req.body;
  const email = String(req.body.email || '').trim().toLowerCase();

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, 'User with this email already registered');
  }

  // Create User
  const user = await User.create({ name, email, password });

  // Automatically initialize a blank Shopping Cart for the user
  await Cart.create({ user: user._id, items: [] });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token in database
  user.refreshToken = refreshToken;
  await user.save();

  // Set HTTP-Only Cookie for Refresh Token
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { accessToken, user: formatUser(user) }, 'User registered successfully'));
});

/**
 * Login User
 */
export const loginUser = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const { password } = req.body;

  // Find user and select password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Compare passwords
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  // Set Refresh Token Cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { accessToken, user: formatUser(user) }, 'Logged in successfully'));
});

/**
 * Logout User
 */
export const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (userId) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

/**
 * Refresh Access Token
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token required');
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret_12345');
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { accessToken }, 'Access token refreshed successfully'));
  } catch (error) {
    throw new ApiError(401, 'Invalid refresh token');
  }
});

/**
 * Forgot Password - Send OTP Email
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User with this email not found');
  }

  // Generate 6 Digit Numeric OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins validity

  user.otp = { code: otpCode, expiresAt: otpExpiry };
  await user.save();

  // Send Email
  await sendOtpEmail(user.email, user.name, otpCode);

  return res.status(200).json(new ApiResponse(200, null, 'OTP sent to registered email successfully'));
});

/**
 * Verify Forgot Password OTP
 */
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.otp || user.otp.code !== code || user.otp.expiresAt < new Date()) {
    throw new ApiError(400, 'Invalid or expired OTP code');
  }

  return res.status(200).json(new ApiResponse(200, { verified: true }, 'OTP code verified successfully'));
});

/**
 * Reset Password using OTP code
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.otp || user.otp.code !== code || user.otp.expiresAt < new Date()) {
    throw new ApiError(400, 'Invalid or expired OTP code');
  }

  // Update password and clear OTP
  user.password = newPassword;
  user.otp = undefined;
  await user.save();

  return res.status(200).json(new ApiResponse(200, null, 'Password reset successfully'));
});

/**
 * Google Login mock/verification support
 */
export const googleLogin = asyncHandler(async (req, res) => {
  const { credential, email, name, googleId } = req.body;

  let user = await User.findOne({ email });

  if (!user) {
    // Create new customer user for Google Sign-In
    user = await User.create({
      name: name || 'Google Otaku',
      email,
      googleId: googleId || `g_${Date.now()}`,
      avatar: {
        public_id: '',
        url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=200&h=200&fit=crop',
      },
    });
    
    // Automatically initialize a blank Shopping Cart for the user
    await Cart.create({ user: user._id, items: [] });
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { accessToken, user: formatUser(user) }, 'Logged in via Google successfully'));
});

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, formatUser(req.user), 'Profile retrieved successfully'));
});

/**
 * Update Profile Details
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const user = req.user;

  if (name) user.name = name;

  // Handles custom avatar file upload if present
  if (req.file && req.file.path) {
    user.avatar = {
      public_id: req.file.filename || '',
      url: req.file.path,
    };
  }

  await user.save();
  return res.status(200).json(new ApiResponse(200, formatUser(user), 'Profile updated successfully'));
});

/**
 * Get Saved User Addresses
 */
export const getAddresses = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user.addresses || [], 'Addresses retrieved successfully'));
});

/**
 * Add New Shipping Address
 */
export const addAddress = asyncHandler(async (req, res) => {
  const addressData = req.body;
  const user = req.user;

  if (addressData.isDefault) {
    // Unset current defaults
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.addresses.push(addressData);
  await user.save();

  return res.status(201).json(new ApiResponse(201, user.addresses, 'Address added successfully'));
});

/**
 * Delete shipping address
 */
export const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  user.addresses = user.addresses.filter((addr) => addr._id.toString() !== id);
  await user.save();

  return res.status(200).json(new ApiResponse(200, user.addresses, 'Address deleted successfully'));
});
