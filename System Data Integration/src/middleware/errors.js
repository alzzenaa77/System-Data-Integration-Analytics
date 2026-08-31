/**
 * Custom Error Classes
 * Requirements: Error handling
 */

class AuthenticationError extends Error {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
    this.status = 401;
  }
}

class AuthorizationError extends Error {
  constructor(message = 'Anda tidak memiliki akses ke resource ini') {
    super(message);
    this.name = 'AuthorizationError';
    this.status = 403;
  }
}

class ValidationError extends Error {
  constructor(message = 'Validation failed', errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.errors = errors;
  }
}

class NotFoundError extends Error {
  constructor(message = 'Data tidak ditemukan') {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

class ConflictError extends Error {
  constructor(message = 'Conflict occurred') {
    super(message);
    this.name = 'ConflictError';
    this.status = 409;
  }
}

/**
 * Global Error Handler Middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  const response = {
    error: {
      message,
      status
    }
  };
  
  if (err.errors) {
    response.error.errors = err.errors;
  }
  
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
  }
  
  res.status(status).json(response);
}

module.exports = {
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  errorHandler
};
