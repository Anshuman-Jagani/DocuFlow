const { Resume, Document, JobPosting } = require('../models');
const { successResponse, errorResponse, paginationMeta } = require('../utils/responses');
const { getPaginationParams, buildOrderClause } = require('../utils/pagination');
const { buildSearchFilter } = require('../utils/queryHelpers');
const { Op } = require('sequelize');

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
 * POST /api/resumes/:id/match-job
 */
exports.matchResumeWithJob = async (req, res, next) => {
  try {
    const { job_id } = req.body;
    
    if (!job_id) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'job_id is required')
      );
    }
    
    // Find resume
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
    
    // Find job posting
    const job = await JobPosting.findByPk(job_id);
    
    if (!job) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Job posting not found')
      );
    }
    
    // Calculate match score
    const matchResult = calculateJobMatch(resume, job);
    
    // Update resume with match data
    await resume.update({
      job_id: job_id,
      match_score: matchResult.score,
      match_details: matchResult.details
    });
    
    // Reload with job data
    await resume.reload({
      include: [{
        model: JobPosting,
        as: 'job'
      }]
    });
    
    res.json(successResponse(
      {
        resume,
        match_result: matchResult
      },
      'Resume matched with job successfully'
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate job match score
 * @private
 */
function calculateJobMatch(resume, job) {
  let score = 0;
  const details = {
    skills_match: 0,
    experience_match: 0,
    matched_skills: [],
    missing_skills: []
  };
  
  // Extract resume skills
  const resumeSkills = resume.skills?.technical || [];
  const requiredSkills = job.required_skills || [];
  const preferredSkills = job.preferred_skills || [];
  
  // Calculate skills match (60% weight)
  if (requiredSkills.length > 0) {
    const matchedRequired = requiredSkills.filter(skill => 
      resumeSkills.some(rs => rs.toLowerCase() === skill.toLowerCase())
    );
    
    details.matched_skills = matchedRequired;
    details.missing_skills = requiredSkills.filter(skill => 
      !matchedRequired.includes(skill)
    );
    
    const requiredMatch = (matchedRequired.length / requiredSkills.length) * 60;
    score += requiredMatch;
    details.skills_match = Math.round(requiredMatch);
  }
  
  // Bonus for preferred skills (20% weight)
  if (preferredSkills.length > 0) {
    const matchedPreferred = preferredSkills.filter(skill => 
      resumeSkills.some(rs => rs.toLowerCase() === skill.toLowerCase())
    );
    
    const preferredMatch = (matchedPreferred.length / preferredSkills.length) * 20;
    score += preferredMatch;
  }
  
  // Experience match (20% weight)
  const experienceRequired = job.experience_required?.toLowerCase() || '';
  const yearsOfExperience = resume.years_of_experience || 0;
  
  if (experienceRequired.includes('entry') && yearsOfExperience >= 0) {
    score += 20;
    details.experience_match = 100;
  } else if (experienceRequired.includes('mid') && yearsOfExperience >= 2) {
    score += 20;
    details.experience_match = 100;
  } else if (experienceRequired.includes('senior') && yearsOfExperience >= 5) {
    score += 20;
    details.experience_match = 100;
  } else if (yearsOfExperience > 0) {
    score += 10;
    details.experience_match = 50;
  }
  
  return {
    score: Math.round(score),
    details
  };
}
