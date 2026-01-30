const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const invoiceController = require('../controllers/invoiceController');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/invoices/stats
 * @desc    Get invoice statistics
 * @access  Private
 */
router.get('/stats', invoiceController.getInvoiceStats);

/**
 * @route   GET /api/invoices
 * @desc    Get all invoices with pagination and filtering
 * @access  Private
 * @query   page, limit, status, vendor_name, invoice_number, start_date, end_date, sort_by, sort_order
 */
router.get('/', invoiceController.listInvoices);

/**
 * @route   GET /api/invoices/:id
 * @desc    Get single invoice by ID
 * @access  Private
 */
router.get('/:id', invoiceController.getInvoice);

/**
 * @route   PUT /api/invoices/:id
 * @desc    Update invoice
 * @access  Private
 */
router.put('/:id', invoiceController.updateInvoice);

/**
 * @route   DELETE /api/invoices/:id
 * @desc    Delete invoice
 * @access  Private
 */
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;
