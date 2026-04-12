/**
 * Custom Error Class
 * Extends the built-in Error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Middleware
 * Handles requests to undefined routes
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found: ${req.originalUrl}`);
  next(error);
};

/**
 * Global Error Handler Middleware
 * Handles all errors and sends appropriate responses
 */
const errorHandler = (err, req, res, next) => {
  // Set default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log error for debugging (in production, use a logging service)
  console.error('Error:', {
    message,
    statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join(', ');
  }

  // Handle Mongoose duplicate key error (unique constraint)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Handle Mongoose cast error (invalid ID format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export { ApiError, notFound, errorHandler };