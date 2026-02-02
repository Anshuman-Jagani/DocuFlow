const express = require('express');
const router = express.Router();
const webhookVerify = require('../middleware/webhookVerify');
const webhookController = require('../controllers/webhookController');

/**
 * Webhook Routes for n8n Integration
 * All routes are protected by HMAC signature verification
 */

/**
 * @route   POST /api/webhooks/document-uploaded
 * @desc    Webhook for document upload notifications
 * @access  Webhook (HMAC verified)
 */
router.post('/document-uploaded', webhookVerify, webhookController.documentUploaded);

/**
 * @route   POST /api/webhooks/invoice-processed
 * @desc    Webhook for processed invoice data from n8n
 * @access  Webhook (HMAC verified)
 */
router.post('/invoice-processed', webhookVerify, webhookController.invoiceProcessed);

/**
 * @route   POST /api/webhooks/resume-processed
 * @desc    Webhook for processed resume data from n8n
 * @access  Webhook (HMAC verified)
 */
router.post('/resume-processed', webhookVerify, webhookController.resumeProcessed);

/**
 * @route   POST /api/webhooks/contract-analyzed
 * @desc    Webhook for analyzed contract data from n8n
 * @access  Webhook (HMAC verified)
 */
router.post('/contract-analyzed', webhookVerify, webhookController.contractAnalyzed);

/**
 * @route   POST /api/webhooks/receipt-processed
 * @desc    Webhook for processed receipt data from n8n
 * @access  Webhook (HMAC verified)
 */
router.post('/receipt-processed', webhookVerify, webhookController.receiptProcessed);

module.exports = router;
