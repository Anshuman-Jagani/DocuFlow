const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

/**
 * Webhook Routes for n8n Integration
 */

/**
 * @route   POST /api/webhooks/document-uploaded
 * @desc    Webhook for document upload notifications
 * @access  Public
 */
router.post('/document-uploaded', webhookController.documentUploaded);

/**
 * @route   POST /api/webhooks/invoice-processed
 * @desc    Webhook for processed invoice data from n8n
 * @access  Public
 */
router.post('/invoice-processed', webhookController.invoiceProcessed);

/**
 * @route   POST /api/webhooks/resume-processed
 * @desc    Webhook for processed resume data from n8n
 * @access  Public
 */
router.post('/resume-processed', webhookController.resumeProcessed);

/**
 * @route   POST /api/webhooks/contract-analyzed
 * @desc    Webhook for analyzed contract data from n8n
 * @access  Public
 */
router.post('/contract-analyzed', webhookController.contractAnalyzed);

/**
 * @route   POST /api/webhooks/receipt-processed
 * @desc    Webhook for processed receipt data from n8n
 * @access  Public
 */
router.post('/receipt-processed', webhookController.receiptProcessed);

module.exports = router;
