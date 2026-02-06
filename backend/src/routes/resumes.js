const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const resumeController = require('../controllers/resumeController');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/resumes
 * @desc    Get all resumes with pagination and filtering
 * @access  Private
 * @query   page, limit, candidate_name, email, min_experience, max_experience, sort_by, sort_order
 */
router.get('/', resumeController.listResumes);

/**
 * @route   GET /api/resumes/:id
 * @desc    Get single resume by ID
 * @access  Private
 */
router.get('/:id', resumeController.getResume);

/**
 * @route   PUT /api/resumes/:id
 * @desc    Update resume
 * @access  Private
 */
router.put('/:id', resumeController.updateResume);

/**
 * @route   DELETE /api/resumes/:id
 * @desc    Delete resume
 * @access  Private
 */
router.delete('/:id', resumeController.deleteResume);

/**
 * @route   POST /api/resumes/:id/match
 * @desc    Match resume with job posting
 * @access  Private
 * @body    { job_id: string }
 */
router.post('/:id/match', resumeController.matchResumeWithJob);

/**
 * @route   POST /api/resumes/batch-match
 * @desc    Batch match all resumes to a job
 * @access  Private
 * @body    { job_id: string }
 */
router.post('/batch-match', resumeController.batchMatchResumes);

module.exports = router;
