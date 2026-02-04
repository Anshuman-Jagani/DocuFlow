const { Contract, Document } = require('../models');
const { successResponse, errorResponse, paginationMeta } = require('../utils/responses');
const { getPaginationParams, buildOrderClause } = require('../utils/pagination');
const { buildDateRangeFilter, buildStatusFilter, buildNumericRangeFilter } = require('../utils/queryHelpers');
const { Op } = require('sequelize');

/**
 * Get all contracts with pagination and filtering
 * GET /api/contracts
 */
exports.listContracts = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { 
      contract_type, 
      status, 
      start_date, 
      end_date,
      min_risk_score,
      max_risk_score,
      contract_title
    } = req.query;
    
    // Build where clause
    const where = {
      user_id: req.user.id,
      ...buildStatusFilter('contract_type', contract_type),
      ...buildStatusFilter('status', status),
      ...buildDateRangeFilter('start_date', start_date, end_date),
      ...buildNumericRangeFilter('risk_score', min_risk_score, max_risk_score)
    };
    
    // Search by contract title
    if (contract_title) {
      where.contract_title = {
        [Op.iLike]: `%${contract_title}%`
      };
    }
    
    // Get contracts with associated documents
    const { count, rows: contracts } = await Contract.findAndCountAll({
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
      contracts,
      'Contracts retrieved successfully',
      paginationMeta(page, limit, count)
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * Get single contract by ID
 * GET /api/contracts/:id
 */
exports.getContract = async (req, res, next) => {
  try {
    const contract = await Contract.findOne({
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
    
    if (!contract) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Contract not found')
      );
    }
    
    res.json(successResponse(contract, 'Contract retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Update contract
 * PUT /api/contracts/:id
 */
exports.updateContract = async (req, res, next) => {
  try {
    const contract = await Contract.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });
    
    if (!contract) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Contract not found')
      );
    }
    
    // Update allowed fields
    const allowedFields = [
      'contract_title', 'contract_type', 'parties', 'start_date',
      'end_date', 'contract_value', 'currency', 'status',
      'key_obligations', 'payment_terms', 'termination_clauses',
      'red_flags', 'risk_score', 'auto_renewal'
    ];
    
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    await contract.update(updates);
    
    res.json(successResponse(contract, 'Contract updated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete contract
 * DELETE /api/contracts/:id
 */
exports.deleteContract = async (req, res, next) => {
  try {
    const contract = await Contract.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });
    
    if (!contract) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Contract not found')
      );
    }
    
    await contract.destroy();
    
    res.json(successResponse(null, 'Contract deleted successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Get contracts expiring soon
 * GET /api/contracts/expiring
 */
exports.getExpiringContracts = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + parseInt(days));
    
    const contracts = await Contract.findAll({
      where: {
        user_id: req.user.id,
        end_date: {
          [Op.between]: [today, futureDate]
        },
        status: {
          [Op.ne]: 'terminated'
        }
      },
      order: [['end_date', 'ASC']],
      include: [{
        model: Document,
        as: 'document',
        attributes: ['id', 'original_filename', 'file_path']
      }]
    });
    
    // Calculate days until expiration for each contract
    const contractsWithDays = contracts.map(contract => {
      const daysUntilExpiration = Math.ceil(
        (new Date(contract.end_date) - today) / (1000 * 60 * 60 * 24)
      );
      
      return {
        ...contract.toJSON(),
        days_until_expiration: daysUntilExpiration
      };
    });
    
    res.json(successResponse(
      contractsWithDays,
      `Found ${contracts.length} contracts expiring in the next ${days} days`
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * Get high-risk contracts
 * GET /api/contracts/high-risk
 */
exports.getHighRiskContracts = async (req, res, next) => {
  try {
    const { min_risk_score = 70 } = req.query;
    
    const contracts = await Contract.findAll({
      where: {
        user_id: req.user.id,
        risk_score: {
          [Op.gte]: parseInt(min_risk_score)
        }
      },
      order: [['risk_score', 'DESC']],
      include: [{
        model: Document,
        as: 'document',
        attributes: ['id', 'original_filename', 'file_path']
      }]
    });
    
    res.json(successResponse(
      contracts,
      `Found ${contracts.length} high-risk contracts`
    ));
  } catch (error) {
    next(error);
  }
};
