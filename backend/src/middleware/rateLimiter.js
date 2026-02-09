const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter Middleware
 * Implements rate limiting for different endpoint types
 */

/**
 * Auth endpoints rate limiter
 * Protects login/register from brute force attacks
 * 50 requests per 15 minutes per IP (increased for development)
 */
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window (increased from 5 for development)
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again after 15 minutes.'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => process.env.NODE_ENV === 'test' // Skip rate limiting in test environment
});

/**
 * File upload rate limiter
 * Prevents abuse of file upload endpoints
 * 50 requests per hour per user (disabled in development)
 */
exports.uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 requests per window
  message: {
    success: false,
    error: {
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      message: 'Too many file uploads. Please try again after 1 hour.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in test and development environments
  skip: (req) => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
  // Use user ID as key if authenticated, otherwise IP
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  }
});

/**
 * General API rate limiter
 * Protects all API endpoints from excessive requests
 * 500 requests per 15 minutes per user (disabled in development)
 */
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per window
  message: {
    success: false,
    error: {
      code: 'API_RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again after 15 minutes.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in test and development environments
  skip: (req) => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
  // Use user ID as key if authenticated, otherwise IP
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  }
});

/**
 * Webhook rate limiter
 * Allows high volume for webhook endpoints
 * 1000 requests per hour
 */
exports.webhookLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per window
  message: {
    success: false,
    error: {
      code: 'WEBHOOK_RATE_LIMIT_EXCEEDED',
      message: 'Webhook rate limit exceeded. Please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test'
});
