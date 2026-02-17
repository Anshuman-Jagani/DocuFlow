const { Document, Invoice, Receipt } = require('../models');
const { successResponse } = require('../utils/responses');
const { Op } = require('sequelize');

/**
 * Get dashboard overview statistics
 * GET /api/dashboard/overview
 */
exports.getDashboardOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { start_date, end_date, period } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (start_date && end_date) {
      dateFilter = {
        createdAt: {
          [Op.between]: [new Date(start_date), new Date(end_date + 'T23:59:59')]
        }
      };
    } else if (period) {
      const now = new Date();
      const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : period === 'year' ? 365 : 7;
      const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
      dateFilter = {
        createdAt: { [Op.gte]: startDate }
      };
    }
    
    // Get all documents for this user
    const documents = await Document.findAll({
      where: { user_id: userId, ...dateFilter }
    });

    // Get invoices and receipts
    const [invoices, receipts] = await Promise.all([
      Invoice.findAll({ where: { user_id: userId } }),
      Receipt.findAll({ where: { user_id: userId } })
    ]);

    // Calculate summary
    const summary = {
      total_documents: documents.length,
      documents_by_type: {
        invoice: documents.filter(d => d.document_type === 'invoice').length,
        receipt: documents.filter(d => d.document_type === 'receipt').length,
        resume: documents.filter(d => d.document_type === 'resume').length,
        contract: documents.filter(d => d.document_type === 'contract').length,
      },
      processing_status: {
        pending: documents.filter(d => d.processing_status === 'pending').length,
        processing: documents.filter(d => d.processing_status === 'processing').length,
        completed: documents.filter(d => d.processing_status === 'completed').length,
        failed: documents.filter(d => d.processing_status === 'failed').length,
      }
    };

    // Calculate financial statistics
    const financial = {
      invoices: {
        total_count: invoices.length,
        total_amount: invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0),
        by_status: {
          pending: invoices.filter(inv => inv.status === 'pending').length,
          paid: invoices.filter(inv => inv.status === 'paid').length,
          overdue: invoices.filter(inv => inv.status === 'overdue').length,
        },
        pending_amount: invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0),
        paid_amount: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0),
      },
      receipts: {
        total_count: receipts.length,
        total_amount: receipts.reduce((sum, rec) => sum + parseFloat(rec.total_amount || 0), 0),
        business_expenses: receipts.filter(rec => rec.is_business_expense).length,
        personal_expenses: receipts.filter(rec => !rec.is_business_expense).length,
        top_categories: Object.entries(
          receipts.reduce((acc, rec) => {
            const cat = rec.expense_category || 'uncategorized';
            acc[cat] = (acc[cat] || 0) + parseFloat(rec.total_amount || 0);
            return acc;
          }, {})
        )
          .map(([category, amount]) => ({ category, amount }))
          .sort((a, b) => b.amount - a.amount)
      }
    };

    // Get recent activity (last 10 documents)
    const recentDocs = await Document.findAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    const recent_activity = recentDocs.map(doc => ({
      id: doc.id,
      type: 'upload',
      document_type: doc.document_type,
      filename: doc.original_filename,
      status: doc.processing_status,
      created_at: doc.createdAt || doc.created_at
    }));

    // Calculate trends
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const allDocs = await Document.findAll({
      where: { user_id: userId }
    });

    const uploads_last_7_days = allDocs.filter(d => new Date(d.createdAt || d.created_at) >= last7Days).length;
    const uploads_last_30_days = allDocs.filter(d => new Date(d.createdAt || d.created_at) >= last30Days).length;

    // Group by date for last 30 days
    const documents_by_date = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = allDocs.filter(d => {
        const docDate = new Date(d.createdAt || d.created_at).toISOString().split('T')[0];
        return docDate === dateStr;
      }).length;
      documents_by_date.push({ date: dateStr, count });
    }

    const trends = {
      uploads_last_7_days,
      uploads_last_30_days,
      documents_by_date
    };

    const data = {
      summary,
      financial,
      recent_activity,
      trends
    };
    
    res.json(successResponse(data, 'Dashboard overview retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent activity feed
 * GET /api/dashboard/activity
 */
exports.getDashboardActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const documents = await Document.findAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']],
      limit: limit
    });

    const activities = documents.map(doc => ({
      id: doc.id.toString(),
      type: 'upload',
      documentType: doc.document_type,
      documentName: doc.original_filename,
      timestamp: doc.createdAt || doc.created_at || doc.upload_date,
      status: doc.processing_status
    }));

    res.json(successResponse({ activities }, 'Activity feed retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Get document processing trends
 * GET /api/dashboard/trends
 */
exports.getDashboardTrends = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const period = parseInt(req.query.period) || 7;
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - period);

    const documents = await Document.findAll({
      where: {
        user_id: userId,
        createdAt: { [Op.gte]: startDate }
      }
    });

    // Group by date
    const trendsMap = {};
    for (let i = 0; i < period; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      trendsMap[ds] = { date: ds, uploads: 0, processed: 0 };
    }

    documents.forEach(doc => {
      const dateStr = new Date(doc.createdAt || doc.upload_date).toISOString().split('T')[0];
      if (trendsMap[dateStr]) {
        trendsMap[dateStr].uploads++;
        if (doc.processing_status === 'completed') {
          trendsMap[dateStr].processed++;
        }
      }
    });

    const trends = Object.values(trendsMap).sort((a, b) => a.date.localeCompare(b.date));

    res.json(successResponse({ trends }, 'Trends data retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Get financial summary data
 * GET /api/dashboard/financial
 */
exports.getFinancialSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [invoices, receipts] = await Promise.all([
      Invoice.findAll({ where: { user_id: userId } }),
      Receipt.findAll({ where: { user_id: userId } })
    ]);

    const summary = {
      totalInvoiceAmount: invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0),
      totalReceiptAmount: receipts.reduce((sum, rec) => sum + parseFloat(rec.total_amount || 0), 0),
      pendingInvoices: invoices.filter(inv => inv.status === 'pending').length,
      currency: 'USD',
      byStatus: {
        paid: invoices.filter(inv => inv.status === 'paid').length,
        pending: invoices.filter(inv => inv.status === 'pending').length,
        overdue: invoices.filter(inv => inv.status === 'overdue').length
      }
    };

    res.json(successResponse(summary, 'Financial summary retrieved successfully'));
  } catch (error) {
    next(error);
  }
};
