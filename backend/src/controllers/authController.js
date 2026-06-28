const crypto = require("crypto");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { signAccessToken, signRefreshToken, getCookieOptions } = require("../utils/tokens");

const sendAuthResponse = async (user, res) => {
  const accessToken = signAccessToken({ id: user._id, role: user.role });
  const refreshToken = signRefreshToken({ id: user._id });

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, getCookieOptions());
  res.status(200).json({
    success: true,
    accessToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
};

exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "User already exists");

  // Public signups are always customers. Admins must be created manually by owner.
  const user = await User.create({ name, email, password, role: "customer" });
  await sendAuthResponse(user, res);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password +refreshToken");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid credentials");
  }
  await sendAuthResponse(user, res);
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) throw new ApiError(401, "Refresh token missing");

  const user = await User.findOne({ refreshToken: token });
  if (!user) throw new ApiError(401, "Invalid refresh token");

  const accessToken = signAccessToken({ id: user._id, role: user.role });
  res.status(200).json({ success: true, accessToken });
});

exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await User.updateOne({ refreshToken: token }, { $unset: { refreshToken: 1 } });
  }
  res.clearCookie("refreshToken", getCookieOptions());
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new ApiError(404, "User not found");

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Use reset token in /api/auth/reset-password/:token",
    resetToken: rawToken,
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "Invalid or expired reset token");

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  await sendAuthResponse(user, res);
});
