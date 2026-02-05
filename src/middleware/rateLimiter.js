const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter Middleware
 * Implements rate limiting for different endpoint types
 */

/**
 * Auth endpoints rate limiter
 * Protects login/register from brute force attacks
 * 5 requests per 15 minutes per IP
 */
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
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
 * 10 requests per hour per user
 */
exports.uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per window
  message: {
    success: false,
    error: {
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      message: 'Too many file uploads. Please try again after 1 hour.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
  // Use user ID as key if authenticated, otherwise IP
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  }
});

/**
 * General API rate limiter
 * Protects all API endpoints from excessive requests
 * 100 requests per 15 minutes per user
 */
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: {
      code: 'API_RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again after 15 minutes.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
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
