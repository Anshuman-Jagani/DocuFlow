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
 * @query   start_date, end_date
 */
router.get('/stats', invoiceController.getInvoiceStats);

/**
 * @route   GET /api/invoices/export/csv
 * @desc    Export invoices as CSV
 * @access  Private
 * @query   status, vendor_name, invoice_number, start_date, end_date, sort_by, sort_order
 */
router.get('/export/csv', invoiceController.exportInvoicesCSV);

/**
 * @route   GET /api/invoices
 * @desc    Get all invoices with pagination and filtering
 * @access  Private
 * @query   page, limit, status, vendor_name, invoice_number, start_date, end_date, sort_by, sort_order
 */
router.get('/', invoiceController.listInvoices);

/**
 * @route   GET /api/invoices/:id/export/pdf
 * @desc    Export single invoice as PDF
 * @access  Private
 */
router.get('/:id/export/pdf', invoiceController.exportInvoicePDF);

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
