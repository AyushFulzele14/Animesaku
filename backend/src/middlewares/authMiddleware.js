const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) throw new ApiError(401, "Unauthorized access");

  const decoded = jwt.verify(token, env.jwtAccessSecret);
  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "Invalid token");

  req.user = user;
  next();
});

const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new ApiError(403, "Forbidden route");
  }
  next();
};

module.exports = { protect, authorize };
