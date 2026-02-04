const { Receipt, Document } = require('../models');
const { successResponse, errorResponse, paginationMeta } = require('../utils/responses');
const { getPaginationParams, buildOrderClause } = require('../utils/pagination');
const { buildDateRangeFilter, buildStatusFilter } = require('../utils/queryHelpers');
const { Op } = require('sequelize');

/**
 * Get all receipts with pagination and filtering
 * GET /api/receipts
 */
exports.listReceipts = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { 
      expense_category, 
      merchant_name,
      is_business_expense,
      start_date, 
      end_date
    } = req.query;
    
    // Build where clause
    const where = {
      user_id: req.user.id,
      ...buildStatusFilter('expense_category', expense_category),
      ...buildDateRangeFilter('receipt_date', start_date, end_date)
    };
    
    // Search by merchant name
    if (merchant_name) {
      where.merchant_name = {
        [Op.iLike]: `%${merchant_name}%`
      };
    }
    
    // Filter by business expense flag
    if (is_business_expense !== undefined) {
      where.is_business_expense = is_business_expense === 'true';
    }
    
    // Get receipts with associated documents
    const { count, rows: receipts } = await Receipt.findAndCountAll({
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
      receipts,
      'Receipts retrieved successfully',
      paginationMeta(page, limit, count)
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * Get single receipt by ID
 * GET /api/receipts/:id
 */
exports.getReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findOne({
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
    
    if (!receipt) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Receipt not found')
      );
    }
    
    res.json(successResponse(receipt, 'Receipt retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Update receipt
 * PUT /api/receipts/:id
 */
exports.updateReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });
    
    if (!receipt) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Receipt not found')
      );
    }
    
    // Update allowed fields
    const allowedFields = [
      'merchant_name', 'receipt_date', 'total_amount', 'currency',
      'tax_amount', 'payment_method', 'expense_category', 'items',
      'is_business_expense', 'notes'
    ];
    
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    await receipt.update(updates);
    
    res.json(successResponse(receipt, 'Receipt updated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete receipt
 * DELETE /api/receipts/:id
 */
exports.deleteReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });
    
    if (!receipt) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Receipt not found')
      );
    }
    
    await receipt.destroy();
    
    res.json(successResponse(null, 'Receipt deleted successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Get receipts grouped by category
 * GET /api/receipts/by-category
 */
exports.getReceiptsByCategory = async (req, res, next) => {
  try {
    const { start_date, end_date, is_business_expense } = req.query;
    
    const where = {
      user_id: req.user.id,
      ...buildDateRangeFilter('receipt_date', start_date, end_date)
    };
    
    if (is_business_expense !== undefined) {
      where.is_business_expense = is_business_expense === 'true';
    }
    
    // Get all receipts
    const receipts = await Receipt.findAll({ where });
    
    // Group by category
    const byCategory = receipts.reduce((acc, receipt) => {
      const category = receipt.expense_category || 'uncategorized';
      
      if (!acc[category]) {
        acc[category] = {
          category,
          count: 0,
          total_amount: 0,
          receipts: []
        };
      }
      
      acc[category].count++;
      acc[category].total_amount += parseFloat(receipt.total_amount || 0);
      acc[category].receipts.push({
        id: receipt.id,
        merchant_name: receipt.merchant_name,
        receipt_date: receipt.receipt_date,
        total_amount: receipt.total_amount,
        currency: receipt.currency
      });
      
      return acc;
    }, {});
    
    // Convert to array and sort by total amount
    const categoriesArray = Object.values(byCategory).sort(
      (a, b) => b.total_amount - a.total_amount
    );
    
    res.json(successResponse(
      categoriesArray,
      'Receipts grouped by category successfully'
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * Get monthly receipt report
 * GET /api/receipts/monthly-report
 */
exports.getMonthlyReport = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'year and month are required')
      );
    }
    
    // Calculate date range for the month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    
    const receipts = await Receipt.findAll({
      where: {
        user_id: req.user.id,
        receipt_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['receipt_date', 'ASC']]
    });
    
    // Calculate summary
    const summary = {
      month: `${year}-${month.toString().padStart(2, '0')}`,
      total_receipts: receipts.length,
      total_amount: receipts.reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0),
      business_expenses: receipts.filter(r => r.is_business_expense).length,
      personal_expenses: receipts.filter(r => !r.is_business_expense).length,
      by_category: {},
      by_payment_method: {}
    };
    
    // Group by category
    receipts.forEach(receipt => {
      const category = receipt.expense_category || 'uncategorized';
      summary.by_category[category] = (summary.by_category[category] || 0) + parseFloat(receipt.total_amount || 0);
      
      const paymentMethod = receipt.payment_method || 'unknown';
      summary.by_payment_method[paymentMethod] = (summary.by_payment_method[paymentMethod] || 0) + parseFloat(receipt.total_amount || 0);
    });
    
    res.json(successResponse(
      {
        summary,
        receipts
      },
      'Monthly receipt report generated successfully'
    ));
  } catch (error) {
    next(error);
  }
};
