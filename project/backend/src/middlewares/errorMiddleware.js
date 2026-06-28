import { ApiError } from '../utils/apiError.js';
import { logger } from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // If not a custom ApiError instance, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, err.errors || [], err.stack);
  }

  // Handle Mongoose Duplicate Key Error (e.g., duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `A record with this ${field} already exists`;
    error = new ApiError(400, message);
  }

  // Handle Mongoose CastError (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Resource not found with invalid id of: ${err.value}`;
    error = new ApiError(404, message);
  }

  // Log the error
  logger.error(`${req.method} ${req.originalUrl} - ${error.statusCode} - ${error.message}`);
  if (process.env.NODE_ENV === 'development' && error.statusCode === 500) {
    console.error(err);
  }

  // Send formatted response
  res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
};
