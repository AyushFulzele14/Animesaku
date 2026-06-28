import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';

/**
 * Protect routes - Verifies JWT Access Token
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication token required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret_12345');
    
    // Attach user instance to request
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'User belonging to this token no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token has expired');
    }
    throw new ApiError(401, 'Invalid authentication token');
  }
});

/**
 * Restrict routes to specific user roles (e.g., admin)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, `User role '${req.user?.role || 'anonymous'}' is not authorized to access this resource`));
    }
    next();
  };
};
