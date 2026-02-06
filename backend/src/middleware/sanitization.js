const { body, query, param, validationResult } = require('express-validator');

/**
 * Input Sanitization Middleware
 * Prevents XSS attacks by sanitizing user inputs
 */

/**
 * Sanitize string inputs
 * Trims whitespace and escapes HTML
 */
const sanitizeString = () => [
  body('*').optional().trim().escape(),
  query('*').optional().trim().escape()
];

/**
 * Sanitize email inputs
 * Normalizes and validates email format
 */
const sanitizeEmail = (field = 'email') => [
  body(field).optional().isEmail().normalizeEmail().trim()
];

/**
 * Validation error handler
 * Returns formatted validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array()
      }
    });
  }
  
  next();
};

/**
 * Sanitize authentication inputs
 */
exports.sanitizeAuthInput = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').trim().isLength({ min: 6 }),
  body('name').optional().trim().escape(),
  handleValidationErrors
];

/**
 * Sanitize invoice inputs
 */
exports.sanitizeInvoiceInput = [
  body('invoice_number').optional().trim().escape(),
  body('vendor_name').optional().trim().escape(),
  body('payment_terms').optional().trim().escape(),
  body('total_amount').optional().isFloat({ min: 0 }),
  body('tax_amount').optional().isFloat({ min: 0 }),
  body('currency').optional().trim().isLength({ min: 3, max: 3 }),
  body('status').optional().isIn(['pending', 'paid', 'overdue', 'cancelled']),
  handleValidationErrors
];

/**
 * Sanitize receipt inputs
 */
exports.sanitizeReceiptInput = [
  body('merchant_name').optional().trim().escape(),
  body('total_amount').optional().isFloat({ min: 0 }),
  body('tax_amount').optional().isFloat({ min: 0 }),
  body('currency').optional().trim().isLength({ min: 3, max: 3 }),
  body('expense_category').optional().trim().escape(),
  body('payment_method').optional().trim().escape(),
  body('notes').optional().trim().escape(),
  body('is_business_expense').optional().isBoolean(),
  handleValidationErrors
];

/**
 * Sanitize contract inputs
 */
exports.sanitizeContractInput = [
  body('contract_title').optional().trim().escape(),
  body('contract_type').optional().trim().escape(),
  body('status').optional().isIn(['draft', 'active', 'expired', 'terminated']),
  body('contract_value').optional().isFloat({ min: 0 }),
  body('currency').optional().trim().isLength({ min: 3, max: 3 }),
  body('risk_score').optional().isInt({ min: 0, max: 100 }),
  body('auto_renewal').optional().isBoolean(),
  handleValidationErrors
];

/**
 * Sanitize resume inputs
 */
exports.sanitizeResumeInput = [
  body('candidate_name').optional().trim().escape(),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('phone').optional().trim().escape(),
  body('years_of_experience').optional().isInt({ min: 0 }),
  body('education_level').optional().trim().escape(),
  body('location').optional().trim().escape(),
  body('match_score').optional().isInt({ min: 0, max: 100 }),
  handleValidationErrors
];

/**
 * Sanitize job posting inputs
 */
exports.sanitizeJobInput = [
  body('job_title').optional().trim().escape(),
  body('company_name').optional().trim().escape(),
  body('location').optional().trim().escape(),
  body('job_type').optional().isIn(['full-time', 'part-time', 'contract', 'internship']),
  body('experience_level').optional().isIn(['entry', 'mid', 'senior', 'lead']),
  body('salary_min').optional().isFloat({ min: 0 }),
  body('salary_max').optional().isFloat({ min: 0 }),
  body('remote_allowed').optional().isBoolean(),
  handleValidationErrors
];

/**
 * General sanitization for query parameters
 */
exports.sanitizeQueryParams = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sort_by').optional().trim().escape(),
  query('sort_order').optional().isIn(['ASC', 'DESC', 'asc', 'desc']),
  handleValidationErrors
];

module.exports.handleValidationErrors = handleValidationErrors;
