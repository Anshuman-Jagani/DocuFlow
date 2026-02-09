const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/dashboard/overview
 * @desc    Get dashboard overview stats
 * @access  Private
 */
router.get('/overview', dashboardController.getDashboardOverview);

/**
 * @route   GET /api/dashboard/activity
 * @desc    Get recent activity feed
 * @access  Private
 */
router.get('/activity', dashboardController.getDashboardActivity);

/**
 * @route   GET /api/dashboard/trends
 * @desc    Get document processing trends
 * @access  Private
 */
router.get('/trends', dashboardController.getDashboardTrends);

/**
 * @route   GET /api/dashboard/financial
 * @desc    Get financial summary data
 * @access  Private
 */
router.get('/financial', dashboardController.getFinancialSummary);

module.exports = router;
