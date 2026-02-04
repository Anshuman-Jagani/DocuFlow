const logger = require('../utils/logger');

/**
 * Middleware to verify webhook requests (DISABLED for manual testing)
 */
const webhookVerify = (req, res, next) => {
  // Log webhook attempt
  logger.info('Webhook request received (Security Bypass Enabled)', {
    path: req.path,
    ip: req.ip
  });

  // Log successful "verification"
  logger.info('Webhook processed (Security Bypass)', {
    path: req.path,
    ip: req.ip,
    documentId: req.body?.document_id,
    documentType: req.body?.document_type
  });

  next();
};

module.exports = webhookVerify;
