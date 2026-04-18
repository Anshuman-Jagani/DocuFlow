const { Invoice, Document } = require('../models');
const { successResponse, errorResponse, paginationMeta } = require('../utils/responses');
const { getPaginationParams, buildOrderClause } = require('../utils/pagination');
const { buildDateRangeFilter, buildSearchFilter, buildStatusFilter } = require('../utils/queryHelpers');
const { Op } = require('sequelize');
const { generateInvoiceCSV, generateInvoicePDF } = require('../services/exportService');

/**
 * Get all invoices with pagination and filtering
 * GET /api/invoices
 */
exports.listInvoices = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { status, search, vendor_name, invoice_number, start_date, end_date, min_amount, max_amount } = req.query;
    
    // Build where clause
    const where = {
      user_id: req.user.id,
      ...buildStatusFilter('status', status),
      ...buildDateRangeFilter('invoice_date', start_date, end_date)
    };

    // Unified search across vendor_name and invoice_number
    if (search) {
      where[Op.or] = [
        { vendor_name:     { [Op.iLike]: `%${search}%` } },
        { invoice_number:  { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Legacy individual field filters (kept for backwards compat)
    if (!search && vendor_name) {
      where.vendor_name = { [Op.iLike]: `%${vendor_name}%` };
    }
    if (!search && invoice_number) {
      where.invoice_number = { [Op.iLike]: `%${invoice_number}%` };
    }

    // Amount range filter
    if (min_amount !== undefined && max_amount !== undefined) {
      where.total_amount = { [Op.between]: [parseFloat(min_amount), parseFloat(max_amount)] };
    } else if (min_amount !== undefined) {
      where.total_amount = { [Op.gte]: parseFloat(min_amount) };
    } else if (max_amount !== undefined) {
      where.total_amount = { [Op.lte]: parseFloat(max_amount) };
    }
    
    // Get invoices with associated documents
    const { count, rows: invoices } = await Invoice.findAndCountAll({
      where,
      limit,
      offset,
      order: buildOrderClause(req.query),
      include: [{
        model: Document,
        as: 'document',
        attributes: ['id', 'original_filename', 'file_path', 'mime_type', 'file_size']
      }]
    });
    
    res.json(successResponse(
      invoices,
      'Invoices retrieved successfully',
      paginationMeta(page, limit, count)
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * Get single invoice by ID
 * GET /api/invoices/:id
 */
exports.getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      },
      include: [{
        model: Document,
        as: 'document',
        attributes: ['id', 'original_filename', 'file_path', 'mime_type', 'file_size', 'created_at']
      }]
    });
    
    if (!invoice) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Invoice not found')
      );
    }
    
    res.json(successResponse(invoice, 'Invoice retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Update invoice
 * PUT /api/invoices/:id
 */
exports.updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });
    
    if (!invoice) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Invoice not found')
      );
    }
    
    // Update allowed fields
    const allowedFields = [
      'invoice_number', 'vendor_name', 'vendor_address', 'vendor_email',
      'vendor_tax_id', 'customer_name', 'customer_address',
      'invoice_date', 'due_date', 'total_amount', 'subtotal', 'tax',
      'currency', 'status', 'line_items', 'tax_details',
      'payment_terms', 'validation_errors', 'confidence_score', 'notes'
    ];
    
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    await invoice.update(updates);
    
    res.json(successResponse(invoice, 'Invoice updated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete invoice
 * DELETE /api/invoices/:id
 */
exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });
    
    if (!invoice) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Invoice not found')
      );
    }
    
    await invoice.destroy();
    
    res.json(successResponse(null, 'Invoice deleted successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Get invoice statistics
 * GET /api/invoices/stats
 */
exports.getInvoiceStats = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    
    const where = {
      user_id: req.user.id,
      ...buildDateRangeFilter('invoice_date', start_date, end_date)
    };
    
    // Get all invoices for stats
    const invoices = await Invoice.findAll({ where });
    
    // Calculate statistics
    const stats = {
      total_invoices: invoices.length,
      total_amount: invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0),
      by_status: {
        pending: invoices.filter(inv => inv.status === 'pending').length,
        paid: invoices.filter(inv => inv.status === 'paid').length,
        overdue: invoices.filter(inv => inv.status === 'overdue').length
      },
      average_amount: invoices.length > 0 
        ? invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0) / invoices.length 
        : 0,
      by_currency: invoices.reduce((acc, inv) => {
        const currency = inv.currency || 'USD';
        acc[currency] = (acc[currency] || 0) + parseFloat(inv.total_amount || 0);
        return acc;
      }, {})
    };
    
    res.json(successResponse(stats, 'Invoice statistics retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Export invoices as CSV
 * GET /api/invoices/export/csv
 */
exports.exportInvoicesCSV = async (req, res, next) => {
  try {
    const { status, vendor_name, invoice_number, start_date, end_date } = req.query;
    
    // Build where clause (same as listInvoices)
    const where = {
      user_id: req.user.id,
      ...buildStatusFilter('status', status),
      ...buildDateRangeFilter('invoice_date', start_date, end_date)
    };
    
    if (vendor_name) {
      where.vendor_name = {
        [Op.iLike]: `%${vendor_name}%`
      };
    }
    
    if (invoice_number) {
      where.invoice_number = {
        [Op.iLike]: `%${invoice_number}%`
      };
    }
    
    // Get all matching invoices (no pagination for export)
    const invoices = await Invoice.findAll({
      where,
      order: buildOrderClause(req.query)
    });
    
    if (invoices.length === 0) {
      return res.status(404).json(
        errorResponse('NO_DATA', 'No invoices found to export')
      );
    }
    
    // Generate CSV
    const csv = generateInvoiceCSV(invoices);
    
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=invoices_${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

/**
 * Export single invoice as PDF
 * GET /api/invoices/:id/export/pdf
 */
exports.exportInvoicePDF = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });
    
    if (!invoice) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Invoice not found')
      );
    }
    
    // Generate PDF
    const doc = generateInvoicePDF(invoice);
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice.invoice_number || invoice.id}_${Date.now()}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    next(error);
  }
};

