const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/dashboard/overview
 * @desc    Get comprehensive dashboard overview with statistics and trends
 * @access  Private
 * @query   start_date, end_date, period (week|month|quarter|year)
 */
router.get('/overview', dashboardController.getDashboardOverview);

module.exports = router;
