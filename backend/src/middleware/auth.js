const { verifyAccessToken } = require('../config/jwt');
const { User } = require('../models');
const { errorResponse } = require('../utils/responses');
const logger = require('../utils/logger');

/**
 * Authenticate JWT token middleware
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        errorResponse('NO_TOKEN', 'No authentication token provided')
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(401).json(
        errorResponse('USER_NOT_FOUND', 'User not found')
      );
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(
        errorResponse('INVALID_TOKEN', 'Invalid authentication token')
      );
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        errorResponse('TOKEN_EXPIRED', 'Authentication token has expired')
      );
    }

    return res.status(500).json(
      errorResponse('AUTH_ERROR', 'Authentication failed')
    );
  }
};

/**
 * Check if user has required role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', 'Authentication required')
      );
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        errorResponse('FORBIDDEN', 'Insufficient permissions')
      );
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Don't fail, just continue without user
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};
