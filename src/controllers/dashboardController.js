const { Document, Invoice, Receipt, Resume, Contract, JobPosting } = require('../models');
const { successResponse, errorResponse } = require('../utils/responses');
const { buildDateRangeFilter } = require('../utils/queryHelpers');
const { Op } = require('sequelize');

/**
 * Get dashboard overview with statistics and trends
 * GET /api/dashboard/overview
 */
exports.getDashboardOverview = async (req, res, next) => {
  try {
    const { start_date, end_date, period } = req.query;
    const userId = req.user.id;
    
    // Calculate date range based on period or custom dates
    let dateFilter = {};
    if (period) {
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        dateFilter = {
          created_at: {
            [Op.gte]: startDate
          }
        };
      }
    } else if (start_date || end_date) {
      dateFilter = buildDateRangeFilter('created_at', start_date, end_date);
    }
    
    // Base where clause for all queries
    const baseWhere = {
      user_id: userId,
      ...dateFilter
    };
    
    // Get all documents with counts by type
    const documents = await Document.findAll({
      where: baseWhere,
      attributes: ['id', 'document_type', 'processing_status', 'created_at'],
      order: [['created_at', 'DESC']]
    });
    
    // Calculate document statistics
    const documentsByType = documents.reduce((acc, doc) => {
      acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
      return acc;
    }, {});
    
    const processingStatus = documents.reduce((acc, doc) => {
      acc[doc.processing_status] = (acc[doc.processing_status] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate recent uploads (last 7 and 30 days)
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const uploadsLast7Days = documents.filter(doc => {
      const createdAt = new Date(doc.created_at);
      return !isNaN(createdAt.getTime()) && createdAt >= last7Days;
    }).length;
    
    const uploadsLast30Days = documents.filter(doc => {
      const createdAt = new Date(doc.created_at);
      return !isNaN(createdAt.getTime()) && createdAt >= last30Days;
    }).length;
    
    // Get invoice statistics
    const invoiceWhere = {
      user_id: userId
    };
    
    // Apply date filter to invoice_date if specified
    if (start_date || end_date) {
      Object.assign(invoiceWhere, buildDateRangeFilter('invoice_date', start_date, end_date));
    } else if (dateFilter.created_at) {
      // Use created_at from Document table via join
      invoiceWhere.created_at = dateFilter.created_at;
    }
    
    const invoices = await Invoice.findAll({
      include: [{
        model: Document,
        as: 'document',
        where: { user_id: userId },
        attributes: ['created_at']
      }],
      attributes: ['id', 'total_amount', 'status', 'currency']
    });
    
    // Filter invoices by date if period is specified
    let filteredInvoices = invoices;
    if (dateFilter.created_at) {
      const startDate = dateFilter.created_at[Op.gte];
      filteredInvoices = invoices.filter(inv => 
        new Date(inv.document.created_at) >= startDate
      );
    }
    
    const invoiceStats = {
      total_count: filteredInvoices.length,
      total_amount: filteredInvoices.reduce((sum, inv) => 
        sum + parseFloat(inv.total_amount || 0), 0
      ),
      by_status: filteredInvoices.reduce((acc, inv) => {
        const status = inv.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      pending_amount: filteredInvoices
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0),
      paid_amount: filteredInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0)
    };
    
    // Get receipt statistics
    const receipts = await Receipt.findAll({
      include: [{
        model: Document,
        as: 'document',
        where: { user_id: userId },
        attributes: ['created_at']
      }],
      attributes: ['id', 'total', 'expense_category', 'is_business_expense', 'currency']
    });
    
    // Filter receipts by date if period is specified
    let filteredReceipts = receipts;
    if (dateFilter.created_at) {
      const startDate = dateFilter.created_at[Op.gte];
      filteredReceipts = receipts.filter(rec => 
        new Date(rec.document.created_at) >= startDate
      );
    }
    
    // Group receipts by category
    const categoryGroups = filteredReceipts.reduce((acc, receipt) => {
      const category = receipt.expense_category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = {
          category,
          amount: 0,
          count: 0
        };
      }
      acc[category].amount += parseFloat(receipt.total || 0);
      acc[category].count++;
      return acc;
    }, {});
    
    const topCategories = Object.values(categoryGroups)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    const receiptStats = {
      total_count: filteredReceipts.length,
      total_amount: filteredReceipts.reduce((sum, rec) => 
        sum + parseFloat(rec.total || 0), 0
      ),
      business_expenses: filteredReceipts.filter(rec => rec.is_business_expense).length,
      personal_expenses: filteredReceipts.filter(rec => !rec.is_business_expense).length,
      top_categories: topCategories
    };
    
    // Generate trend data (documents by date)
    const documentsByDate = {};
    documents.forEach(doc => {
      const createdAt = new Date(doc.created_at);
      if (!isNaN(createdAt.getTime())) {
        const date = createdAt.toISOString().split('T')[0];
        documentsByDate[date] = (documentsByDate[date] || 0) + 1;
      }
    });
    
    const trendsArray = Object.entries(documentsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days of data
    
    // Get recent activity (last 10 documents)
    const recentActivity = documents.slice(0, 10).map(doc => ({
      id: doc.id,
      type: doc.document_type,
      status: doc.processing_status,
      created_at: doc.created_at ? doc.created_at.toISOString() : null
    }));
    
    // Build response
    const overview = {
      summary: {
        total_documents: documents.length,
        documents_by_type: {
          invoice: documentsByType.invoice || 0,
          receipt: documentsByType.receipt || 0,
          resume: documentsByType.resume || 0,
          contract: documentsByType.contract || 0
        },
        recent_uploads: uploadsLast7Days,
        processing_status: {
          completed: processingStatus.completed || 0,
          processing: processingStatus.processing || 0,
          pending: processingStatus.pending || 0,
          failed: processingStatus.failed || 0,
          needs_review: processingStatus.needs_review || 0
        }
      },
      financial: {
        invoices: invoiceStats,
        receipts: receiptStats
      },
      trends: {
        documents_by_date: trendsArray,
        uploads_last_7_days: uploadsLast7Days,
        uploads_last_30_days: uploadsLast30Days
      },
      recent_activity: recentActivity
    };
    
    res.json(successResponse(overview, 'Dashboard overview retrieved successfully'));
  } catch (error) {
    next(error);
  }
};
