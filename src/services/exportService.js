const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

/**
 * Export Service
 * Handles CSV and PDF generation for invoices and receipts
 */

/**
 * Format currency for display
 */
const formatCurrency = (amount, currency = 'USD') => {
  if (!amount && amount !== 0) return 'N/A';
  return `${currency} ${parseFloat(amount).toFixed(2)}`;
};

/**
 * Format date for display
 */
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Generate CSV for invoices
 * @param {Array} invoices - Array of invoice objects
 * @returns {String} CSV string
 */
exports.generateInvoiceCSV = (invoices) => {
  try {
    // Flatten invoice data for CSV
    const flattenedData = invoices.map(invoice => ({
      'Invoice Number': invoice.invoice_number || 'N/A',
      'Vendor': invoice.vendor_name || 'N/A',
      'Issue Date': formatDate(invoice.issue_date),
      'Due Date': formatDate(invoice.due_date),
      'Total Amount': invoice.total_amount || 0,
      'Currency': invoice.currency || 'USD',
      'Status': invoice.status || 'pending',
      'Tax Amount': invoice.tax_amount || 0,
      'Payment Terms': invoice.payment_terms || 'N/A',
      'Created At': formatDate(invoice.created_at)
    }));

    const fields = [
      'Invoice Number',
      'Vendor',
      'Issue Date',
      'Due Date',
      'Total Amount',
      'Currency',
      'Status',
      'Tax Amount',
      'Payment Terms',
      'Created At'
    ];

    const parser = new Parser({ fields });
    return parser.parse(flattenedData);
  } catch (error) {
    throw new Error(`Failed to generate invoice CSV: ${error.message}`);
  }
};

/**
 * Generate PDF for a single invoice
 * @param {Object} invoice - Invoice object
 * @returns {PDFDocument} PDF document stream
 */
exports.generateInvoicePDF = (invoice) => {
  try {
    const doc = new PDFDocument({ margin: 50 });

    // Header
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();

    // Invoice details
    doc.fontSize(12);
    doc.text(`Invoice Number: ${invoice.invoice_number || 'N/A'}`, { bold: true });
    doc.text(`Vendor: ${invoice.vendor_name || 'N/A'}`);
    doc.text(`Issue Date: ${formatDate(invoice.issue_date)}`);
    doc.text(`Due Date: ${formatDate(invoice.due_date)}`);
    doc.text(`Status: ${(invoice.status || 'pending').toUpperCase()}`);
    doc.moveDown();

    // Line items section
    if (invoice.line_items && Array.isArray(invoice.line_items) && invoice.line_items.length > 0) {
      doc.fontSize(14).text('Line Items:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);

      invoice.line_items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.description || 'Item'}`);
        doc.text(`   Quantity: ${item.quantity || 1} × ${formatCurrency(item.unit_price, invoice.currency)} = ${formatCurrency(item.total, invoice.currency)}`);
        doc.moveDown(0.3);
      });
      doc.moveDown();
    }

    // Financial summary
    doc.fontSize(12);
    doc.text(`Subtotal: ${formatCurrency(invoice.subtotal, invoice.currency)}`, { align: 'right' });
    doc.text(`Tax: ${formatCurrency(invoice.tax_amount, invoice.currency)}`, { align: 'right' });
    doc.fontSize(14);
    doc.text(`Total Amount: ${formatCurrency(invoice.total_amount, invoice.currency)}`, { 
      align: 'right',
      bold: true 
    });
    doc.moveDown();

    // Payment terms
    if (invoice.payment_terms) {
      doc.fontSize(10);
      doc.text(`Payment Terms: ${invoice.payment_terms}`);
    }

    // Footer
    doc.fontSize(8).text(
      `Generated on ${new Date().toLocaleString()}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    return doc;
  } catch (error) {
    throw new Error(`Failed to generate invoice PDF: ${error.message}`);
  }
};

/**
 * Generate CSV for receipts
 * @param {Array} receipts - Array of receipt objects
 * @returns {String} CSV string
 */
exports.generateReceiptCSV = (receipts) => {
  try {
    // Flatten receipt data for CSV
    const flattenedData = receipts.map(receipt => ({
      'Merchant': receipt.merchant_name || 'N/A',
      'Purchase Date': formatDate(receipt.purchase_date),
      'Total Amount': receipt.total_amount || 0,
      'Currency': receipt.currency || 'USD',
      'Category': receipt.expense_category || 'N/A',
      'Payment Method': receipt.payment_method || 'N/A',
      'Tax Amount': receipt.tax_amount || 0,
      'Business Expense': receipt.is_business_expense ? 'Yes' : 'No',
      'Notes': receipt.notes || '',
      'Created At': formatDate(receipt.created_at)
    }));

    const fields = [
      'Merchant',
      'Purchase Date',
      'Total Amount',
      'Currency',
      'Category',
      'Payment Method',
      'Tax Amount',
      'Business Expense',
      'Notes',
      'Created At'
    ];

    const parser = new Parser({ fields });
    return parser.parse(flattenedData);
  } catch (error) {
    throw new Error(`Failed to generate receipt CSV: ${error.message}`);
  }
};

/**
 * Generate PDF for a single receipt
 * @param {Object} receipt - Receipt object
 * @returns {PDFDocument} PDF document stream
 */
exports.generateReceiptPDF = (receipt) => {
  try {
    const doc = new PDFDocument({ margin: 50 });

    // Header
    doc.fontSize(20).text('RECEIPT', { align: 'center' });
    doc.moveDown();

    // Receipt details
    doc.fontSize(12);
    doc.text(`Merchant: ${receipt.merchant_name || 'N/A'}`, { bold: true });
    doc.text(`Purchase Date: ${formatDate(receipt.purchase_date)}`);
    doc.text(`Category: ${receipt.expense_category || 'N/A'}`);
    doc.text(`Payment Method: ${receipt.payment_method || 'N/A'}`);
    doc.text(`Business Expense: ${receipt.is_business_expense ? 'Yes' : 'No'}`);
    doc.moveDown();

    // Items section
    if (receipt.items && Array.isArray(receipt.items) && receipt.items.length > 0) {
      doc.fontSize(14).text('Items:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);

      receipt.items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.description || 'Item'}`);
        doc.text(`   Quantity: ${item.quantity || 1} × ${formatCurrency(item.unit_price, receipt.currency)} = ${formatCurrency(item.total, receipt.currency)}`);
        doc.moveDown(0.3);
      });
      doc.moveDown();
    }

    // Financial summary
    doc.fontSize(12);
    doc.text(`Subtotal: ${formatCurrency(receipt.subtotal, receipt.currency)}`, { align: 'right' });
    doc.text(`Tax: ${formatCurrency(receipt.tax_amount, receipt.currency)}`, { align: 'right' });
    doc.fontSize(14);
    doc.text(`Total Amount: ${formatCurrency(receipt.total_amount, receipt.currency)}`, { 
      align: 'right',
      bold: true 
    });
    doc.moveDown();

    // Notes
    if (receipt.notes) {
      doc.fontSize(10);
      doc.text(`Notes: ${receipt.notes}`);
    }

    // Footer
    doc.fontSize(8).text(
      `Generated on ${new Date().toLocaleString()}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    return doc;
  } catch (error) {
    throw new Error(`Failed to generate receipt PDF: ${error.message}`);
  }
};
