const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const receiptController = require('../controllers/receiptController');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/receipts/by-category
 * @desc    Get receipts grouped by expense category
 * @access  Private
 * @query   start_date, end_date, is_business_expense
 */
router.get('/by-category', receiptController.getReceiptsByCategory);

/**
 * @route   GET /api/receipts/monthly-report
 * @desc    Get monthly receipt report
 * @access  Private
 * @query   year, month (required)
 */
router.get('/monthly-report', receiptController.getMonthlyReport);

/**
 * @route   GET /api/receipts
 * @desc    Get all receipts with pagination and filtering
 * @access  Private
 * @query   page, limit, expense_category, merchant_name, is_business_expense, start_date, end_date, sort_by, sort_order
 */
router.get('/', receiptController.listReceipts);

/**
 * @route   GET /api/receipts/:id
 * @desc    Get single receipt by ID
 * @access  Private
 */
router.get('/:id', receiptController.getReceipt);

/**
 * @route   PUT /api/receipts/:id
 * @desc    Update receipt
 * @access  Private
 */
router.put('/:id', receiptController.updateReceipt);

/**
 * @route   DELETE /api/receipts/:id
 * @desc    Delete receipt
 * @access  Private
 */
router.delete('/:id', receiptController.deleteReceipt);

module.exports = router;
