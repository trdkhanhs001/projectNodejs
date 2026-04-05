class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  // Handle Joi validation errors
  if (err.isJoi) {
    statusCode = 400;
    message = 'Validation Error';
    details = err.details ? err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      type: detail.type
    })) : err.message;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = Object.keys(err.errors).map(field => ({
      field,
      message: err.errors[field].message
    }));
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    details = {
      field: err.path,
      value: err.value
    };
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
    const field = Object.keys(err.keyPattern)[0];
    details = {
      field,
      message: `${field} already exists`
    };
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error details in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', {
      status: statusCode,
      message,
      details,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      body: req.body
    });
  } else {
    // Log errors in production (without sensitive data)
    console.error('[ERROR]', {
      status: statusCode,
      message,
      url: req.originalUrl,
      method: req.method
    });
  }

  // Build error response
  const errorResponse = {
    error: {
      status: statusCode,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  };

  // Add request ID if available (for tracking)
  if (req.id) {
    errorResponse.requestId = req.id;
  }

  res.status(statusCode).json(errorResponse);
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const notFoundHandler = (req, res, next) => {
  const error = new ApiError(
    404,
    `Route not found: ${req.originalUrl}`,
    { method: req.method, url: req.originalUrl }
  );
  next(error);
};

module.exports = {
  ApiError,
  errorHandler,
  asyncHandler,
  notFoundHandler
};
