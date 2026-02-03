const express = require('express');
const router = express.Router();
const jobPostingController = require('../controllers/jobPostingController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { body } = require('express-validator');

// Validation schemas
const jobPostingValidation = [
  body('title').notEmpty().withMessage('Title is required').trim().isLength({ max: 255 }),
  body('description').notEmpty().withMessage('Description is required'),
  body('required_skills').optional().isArray().withMessage('Required skills must be an array'),
  body('preferred_skills').optional().isArray().withMessage('Preferred skills must be an array'),
  body('status').optional().isIn(['open', 'closed']).withMessage('Invalid status')
];

// Routes
router.post('/', authenticate, jobPostingValidation, validate, jobPostingController.createJobPosting);
router.get('/', authenticate, jobPostingController.getAllJobPostings);
router.get('/:id', authenticate, jobPostingController.getJobPostingById);
router.patch('/:id', authenticate, jobPostingValidation, validate, jobPostingController.updateJobPosting);
router.delete('/:id', authenticate, jobPostingController.deleteJobPosting);

module.exports = router;
