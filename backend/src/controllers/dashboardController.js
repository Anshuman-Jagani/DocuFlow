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
    
    // Get all documents for this user
    const documents = await Document.findAll({
      where: { user_id: userId }
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      totalDocuments: documents.length,
      documentsByType: {
        invoice: documents.filter(d => d.document_type === 'invoice').length,
        receipt: documents.filter(d => d.document_type === 'receipt').length,
        resume: documents.filter(d => d.document_type === 'resume').length,
        contract: documents.filter(d => d.document_type === 'contract').length,
      },
      processingStatus: {
        pending: documents.filter(d => d.processing_status === 'pending').length,
        completed: documents.filter(d => d.processing_status === 'completed').length,
        failed: documents.filter(d => d.processing_status === 'failed').length,
      },
      thisMonth: {
        uploaded: documents.filter(d => new Date(d.createdAt || d.created_at || d.upload_date) >= startOfMonth).length,
        processed: documents.filter(d => d.processing_status === 'completed' && new Date(d.createdAt || d.created_at || d.upload_date) >= startOfMonth).length,
      }
    };
    
    res.json(successResponse(stats, 'Dashboard overview retrieved successfully'));
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
