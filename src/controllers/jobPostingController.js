const { JobPosting } = require('../models');
const { successResponse, errorResponse } = require('../utils/responses');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Create a new job posting
 * POST /api/job-postings
 */
const createJobPosting = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      required_skills, 
      preferred_skills, 
      experience_required, 
      location,
      status 
    } = req.body;

    const jobPosting = await JobPosting.create({
      title,
      description,
      required_skills: required_skills || [],
      preferred_skills: preferred_skills || [],
      experience_required,
      location,
      status: status || 'open'
    });

    logger.info(`Job posting created successfully: ${jobPosting.id}`);

    return res.status(201).json(
      successResponse({ jobPosting }, 'Job posting created successfully')
    );
  } catch (error) {
    logger.error('Error creating job posting:', error);
    return res.status(500).json(
      errorResponse('CREATE_FAILED', 'Failed to create job posting')
    );
  }
};

/**
 * Get all job postings with pagination and filters
 * GET /api/job-postings
 */
const getAllJobPostings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      sort_by = 'created_at',
      order = 'DESC'
    } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const offset = (parsedPage - 1) * parsedLimit;

    const { count, rows: jobPostings } = await JobPosting.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [[sort_by, order.toUpperCase()]]
    });

    const totalPages = Math.ceil(count / parsedLimit);
    const pagination = {
      page: parsedPage,
      limit: parsedLimit,
      total: count,
      totalPages
    };

    return res.json(
      successResponse({ jobPostings }, 'Job postings retrieved successfully', { pagination })
    );
  } catch (error) {
    logger.error('Error fetching job postings:', error);
    return res.status(500).json(
      errorResponse('FETCH_FAILED', 'Failed to fetch job postings')
    );
  }
};

/**
 * Get a single job posting by ID
 * GET /api/job-postings/:id
 */
const getJobPostingById = async (req, res) => {
  try {
    const { id } = req.params;
    const jobPosting = await JobPosting.findByPk(id);

    if (!jobPosting) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Job posting not found')
      );
    }

    return res.json(
      successResponse({ jobPosting }, 'Job posting retrieved successfully')
    );
  } catch (error) {
    logger.error('Error fetching job posting:', error);
    return res.status(500).json(
      errorResponse('FETCH_FAILED', 'Failed to fetch job posting')
    );
  }
};

/**
 * Update a job posting
 * PATCH /api/job-postings/:id
 */
const updateJobPosting = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      required_skills, 
      preferred_skills, 
      experience_required, 
      location,
      status 
    } = req.body;

    const jobPosting = await JobPosting.findByPk(id);

    if (!jobPosting) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Job posting not found')
      );
    }

    await jobPosting.update({
      title: title !== undefined ? title : jobPosting.title,
      description: description !== undefined ? description : jobPosting.description,
      required_skills: required_skills !== undefined ? required_skills : jobPosting.required_skills,
      preferred_skills: preferred_skills !== undefined ? preferred_skills : jobPosting.preferred_skills,
      experience_required: experience_required !== undefined ? experience_required : jobPosting.experience_required,
      location: location !== undefined ? location : jobPosting.location,
      status: status !== undefined ? status : jobPosting.status
    });

    logger.info(`Job posting updated successfully: ${id}`);

    return res.json(
      successResponse({ jobPosting }, 'Job posting updated successfully')
    );
  } catch (error) {
    logger.error('Error updating job posting:', error);
    return res.status(500).json(
      errorResponse('UPDATE_FAILED', 'Failed to update job posting')
    );
  }
};

/**
 * Delete a job posting
 * DELETE /api/job-postings/:id
 */
const deleteJobPosting = async (req, res) => {
  try {
    const { id } = req.params;
    const jobPosting = await JobPosting.findByPk(id);

    if (!jobPosting) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Job posting not found')
      );
    }

    await jobPosting.destroy();
    logger.info(`Job posting deleted successfully: ${id}`);

    return res.json(
      successResponse({ id }, 'Job posting deleted successfully')
    );
  } catch (error) {
    logger.error('Error deleting job posting:', error);
    return res.status(500).json(
      errorResponse('DELETE_FAILED', 'Failed to delete job posting')
    );
  }
};

module.exports = {
  createJobPosting,
  getAllJobPostings,
  getJobPostingById,
  updateJobPosting,
  deleteJobPosting
};
