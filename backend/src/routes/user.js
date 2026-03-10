const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { body } = require('express-validator');

// Validation rules
const profileValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
];

const passwordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
];

/**
 * @route   PATCH /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.patch('/profile',
  authenticate,
  profileValidation,
  validate,
  userController.updateProfile
);

/**
 * @route   PATCH /api/users/password
 * @desc    Change user password
 * @access  Private
 */
router.patch('/password',
  authenticate,
  passwordValidation,
  validate,
  userController.updatePassword
);

module.exports = router;
