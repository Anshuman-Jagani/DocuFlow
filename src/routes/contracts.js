const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const contractController = require('../controllers/contractController');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/contracts/expiring
 * @desc    Get contracts expiring soon
 * @access  Private
 * @query   days (default: 30)
 */
router.get('/expiring', contractController.getExpiringContracts);

/**
 * @route   GET /api/contracts/high-risk
 * @desc    Get high-risk contracts
 * @access  Private
 * @query   min_risk_score (default: 70)
 */
router.get('/high-risk', contractController.getHighRiskContracts);

/**
 * @route   GET /api/contracts
 * @desc    Get all contracts with pagination and filtering
 * @access  Private
 * @query   page, limit, contract_type, status, start_date, end_date, min_risk_score, max_risk_score, contract_title, sort_by, sort_order
 */
router.get('/', contractController.listContracts);

/**
 * @route   GET /api/contracts/:id
 * @desc    Get single contract by ID
 * @access  Private
 */
router.get('/:id', contractController.getContract);

/**
 * @route   PUT /api/contracts/:id
 * @desc    Update contract
 * @access  Private
 */
router.put('/:id', contractController.updateContract);

/**
 * @route   DELETE /api/contracts/:id
 * @desc    Delete contract
 * @access  Private
 */
router.delete('/:id', contractController.deleteContract);

module.exports = router;
