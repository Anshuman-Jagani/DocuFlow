const { verifySignature, isTimestampValid } = require('../utils/crypto');
const logger = require('../utils/logger');

/**
 * Middleware to verify webhook requests using HMAC signature
 * Validates both signature and timestamp to prevent replay attacks
 */
const webhookVerify = (req, res, next) => {
  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

  // Log webhook attempt
  logger.info('Webhook request received', {
    path: req.path,
    ip: req.ip,
    hasSignature: !!signature,
    hasTimestamp: !!timestamp
  });

  // Check for required headers
  if (!signature) {
    logger.warn('Webhook request missing signature', {
      path: req.path,
      ip: req.ip
    });
    return res.status(401).json({
      success: false,
      error: {
        code: 'MISSING_SIGNATURE',
        message: 'X-Webhook-Signature header is required'
      }
    });
  }

  if (!timestamp) {
    logger.warn('Webhook request missing timestamp', {
      path: req.path,
      ip: req.ip
    });
    return res.status(401).json({
      success: false,
      error: {
        code: 'MISSING_TIMESTAMP',
        message: 'X-Webhook-Timestamp header is required'
      }
    });
  }

  // Validate timestamp (prevent replay attacks)
  if (!isTimestampValid(timestamp)) {
    logger.warn('Webhook request with invalid timestamp', {
      path: req.path,
      ip: req.ip,
      timestamp,
      age: Date.now() - parseInt(timestamp, 10)
    });
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TIMESTAMP',
        message: 'Timestamp is too old or invalid (max 5 minutes)'
      }
    });
  }

  // Get raw body for signature verification
  // Note: Body should be parsed as raw buffer before this middleware
  let payload;
  
  if (Buffer.isBuffer(req.body)) {
    payload = req.body.toString('utf8');
  } else if (typeof req.body === 'string') {
    payload = req.body;
  } else {
    // Body already parsed as JSON
    payload = JSON.stringify(req.body);
  }

  // Verify HMAC signature
  if (!verifySignature(payload, signature, webhookSecret)) {
    logger.warn('Webhook request with invalid signature', {
      path: req.path,
      ip: req.ip,
      providedSignature: signature.substring(0, 10) + '...'
    });
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_SIGNATURE',
        message: 'Webhook signature verification failed'
      }
    });
  }

  // Parse body if it's still a string/buffer
  if (typeof payload === 'string') {
    try {
      req.body = JSON.parse(payload);
    } catch (error) {
      logger.error('Failed to parse webhook payload', {
        path: req.path,
        error: error.message
      });
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'Failed to parse JSON payload'
        }
      });
    }
  }

  // Log successful verification
  logger.info('Webhook signature verified successfully', {
    path: req.path,
    ip: req.ip,
    documentId: req.body?.document_id,
    documentType: req.body?.document_type
  });

  next();
};

module.exports = webhookVerify;
