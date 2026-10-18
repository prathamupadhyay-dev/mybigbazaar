/**
 * @file apps/api/middleware/error.middleware.js
 * @description Centralized error classes and Express error-handling middleware
 */

export class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Access forbidden: Insufficient permissions') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Resource conflict or duplicate entry') {
    return new ApiError(409, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}

/**
 * Async handler wrapper to catch unhandled rejections and pass to next()
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Route Not Found middleware
 */
export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Cannot ${req.method} ${req.originalUrl} - Route not found`));
};

/**
 * Central Express error handler
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred';
  let errors = err.errors || [];

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for parameter: ${err.path}`;
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An entry with this ${field} already exists`;
    errors = [{ field, message: `${field} must be unique` }];
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired. Please log in again';
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    message = `Upload error: ${err.message}`;
  }

  // Log 500 server errors
  if (statusCode >= 500) {
    console.error(`[SERVER_ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
    statusCode,
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {})
  });
};
