const { Invoice, Document } = require('../models');
const { successResponse, errorResponse, paginationMeta } = require('../utils/responses');
const { getPaginationParams, buildOrderClause } = require('../utils/pagination');
const { buildDateRangeFilter, buildSearchFilter, buildStatusFilter } = require('../utils/queryHelpers');
const { Op } = require('sequelize');

/**
 * Get all invoices with pagination and filtering
 * GET /api/invoices
 */
exports.listInvoices = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { status, vendor_name, invoice_number, start_date, end_date } = req.query;
    
    // Build where clause
    const where = {
      user_id: req.user.id,
      ...buildStatusFilter('status', status),
      ...buildDateRangeFilter('invoice_date', start_date, end_date)
    };
    
    // Add search filters
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
    
    // Get invoices with associated documents
    const { count, rows: invoices } = await Invoice.findAndCountAll({
      where,
      limit,
      offset,
      order: buildOrderClause(req.query),
      include: [{
        model: Document,
        as: 'document',
        attributes: ['id', 'filename', 'file_path', 'file_type', 'file_size']
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
        attributes: ['id', 'filename', 'file_path', 'file_type', 'file_size', 'created_at']
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
      'invoice_number', 'vendor_name', 'invoice_date', 'due_date',
      'total_amount', 'currency', 'status', 'line_items', 'tax_details',
      'payment_terms', 'validation_errors', 'confidence_score'
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
