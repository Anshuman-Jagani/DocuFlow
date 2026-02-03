const { Resume, Document, JobPosting } = require('../models');
const { successResponse, errorResponse, paginationMeta } = require('../utils/responses');
const { getPaginationParams, buildOrderClause } = require('../utils/pagination');
const { buildSearchFilter } = require('../utils/queryHelpers');
const { Op } = require('sequelize');
const matchingService = require('../services/matchingService');

/**
 * Get all resumes with pagination and filtering
 * GET /api/resumes
 */
exports.listResumes = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { candidate_name, email, min_experience, max_experience } = req.query;
    
    // Build where clause
    const where = {
      user_id: req.user.id
    };
    
    // Search by candidate name
    if (candidate_name) {
      where.candidate_name = {
        [Op.iLike]: `%${candidate_name}%`
      };
    }
    
    // Search by email
    if (email) {
      where.candidate_email = {
        [Op.iLike]: `%${email}%`
      };
    }
    
    // Filter by years of experience
    if (min_experience !== undefined) {
      where.years_of_experience = {
        [Op.gte]: parseInt(min_experience)
      };
    }
    
    if (max_experience !== undefined) {
      where.years_of_experience = {
        ...where.years_of_experience,
        [Op.lte]: parseInt(max_experience)
      };
    }
    
    // Get resumes with associated documents and jobs
    const { count, rows: resumes } = await Resume.findAndCountAll({
      where,
      limit,
      offset,
      order: buildOrderClause(req.query),
      include: [
        {
          model: Document,
          as: 'document',
          attributes: ['id', 'filename', 'file_path', 'file_type', 'file_size']
        },
        {
          model: JobPosting,
          as: 'job',
          attributes: ['id', 'title', 'location', 'status'],
          required: false
        }
      ]
    });
    
    res.json(successResponse(
      resumes,
      'Resumes retrieved successfully',
      paginationMeta(page, limit, count)
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * Get single resume by ID
 * GET /api/resumes/:id
 */
exports.getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      },
      include: [
        {
          model: Document,
          as: 'document',
          attributes: ['id', 'filename', 'file_path', 'file_type', 'file_size', 'created_at']
        },
        {
          model: JobPosting,
          as: 'job',
          required: false
        }
      ]
    });
    
    if (!resume) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Resume not found')
      );
    }
    
    res.json(successResponse(resume, 'Resume retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Update resume
 * PUT /api/resumes/:id
 */
exports.updateResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });
    
    if (!resume) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Resume not found')
      );
    }
    
    // Update allowed fields
    const allowedFields = [
      'candidate_name', 'candidate_email', 'candidate_phone',
      'years_of_experience', 'skills', 'experience', 'education',
      'certifications', 'summary', 'match_score', 'match_details'
    ];
    
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    await resume.update(updates);
    
    res.json(successResponse(resume, 'Resume updated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete resume
 * DELETE /api/resumes/:id
 */
exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });
    
    if (!resume) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Resume not found')
      );
    }
    
    await resume.destroy();
    
    res.json(successResponse(null, 'Resume deleted successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Match resume with job posting
 * POST /api/resumes/:id/match
 */
exports.matchResumeWithJob = async (req, res, next) => {
  try {
    const { job_id } = req.body;
    
    if (!job_id) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'job_id is required')
      );
    }
    
    // Perform matching using the service
    const matchResult = await matchingService.matchResumeToJob(req.params.id, job_id);
    
    // Fetch updated resume with job data
    const resume = await Resume.findOne({
      where: { id: req.params.id },
      include: [{ model: JobPosting, as: 'job' }]
    });
    
    res.json(successResponse(
      {
        resume,
        match_result: matchResult
      },
      'Resume matched with job successfully'
    ));
  } catch (error) {
    if (error.message === 'Resume or Job Posting not found') {
      return res.status(404).json(errorResponse('NOT_FOUND', error.message));
    }
    next(error);
  }
};

/**
 * Batch match all resumes to a job
 * POST /api/resumes/batch-match
 */
exports.batchMatchResumes = async (req, res, next) => {
  try {
    const { job_id } = req.body;
    
    if (!job_id) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'job_id is required')
      );
    }
    
    const results = await matchingService.batchMatch(job_id);
    
    res.json(successResponse(
      {
        results,
        count: results.length
      },
      'Batch matching completed successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// function calculateJobMatch removed - replaced by matchingService
