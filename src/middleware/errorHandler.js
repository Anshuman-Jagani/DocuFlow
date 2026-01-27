const logger = require('../utils/logger');
const { errorResponse } = require('../utils/responses');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json(
      errorResponse('VALIDATION_ERROR', 'Validation failed', errors)
    );
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json(
      errorResponse('DUPLICATE_ERROR', 'Resource already exists')
    );
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json(
      errorResponse('REFERENCE_ERROR', 'Referenced resource not found')
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      errorResponse('INVALID_TOKEN', 'Invalid authentication token')
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      errorResponse('TOKEN_EXPIRED', 'Authentication token has expired')
    );
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(
        errorResponse('FILE_TOO_LARGE', 'File size exceeds maximum limit')
      );
    }
    return res.status(400).json(
      errorResponse('UPLOAD_ERROR', err.message)
    );
  }

  // Custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json(
      errorResponse(err.code || 'APPLICATION_ERROR', err.message, err.details)
    );
  }

  // Default server error
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json(
    errorResponse('INTERNAL_ERROR', message)
  );
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json(
    errorResponse('NOT_FOUND', `Route ${req.method} ${req.path} not found`)
  );
};

module.exports = {
  errorHandler,
  notFoundHandler
};
