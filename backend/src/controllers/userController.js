const { User } = require('../models');
const { successResponse, errorResponse } = require('../utils/responses');
const logger = require('../utils/logger');

/**
 * Update user profile
 * PATCH /api/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = req.user;

    logger.info(`Attempting to update profile for user: ${user.email}`, { name, email });

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        logger.warn(`Email update failed - already taken: ${email}`);
        return res.status(409).json(
          errorResponse('EMAIL_TAKEN', 'This email is already associated with another account')
        );
      }
    }

    // Update properties and save
    if (name !== undefined) user.full_name = name;
    if (email !== undefined) user.email = email;
    
    await user.save();

    logger.info(`User profile successfully updated: ${user.email}`);

    res.json(
      successResponse(user.toSafeObject(), 'Profile updated successfully')
    );
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
};

/**
 * Change user password
 * PATCH /api/users/password
 */
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    logger.info(`Attempting to change password for user: ${user.email}`);

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      logger.warn(`Password change failed - invalid current password for: ${user.email}`);
      return res.status(401).json(
        errorResponse('INVALID_PASSWORD', 'The current password you entered is incorrect')
      );
    }

    // Update password (will be hashed by model hook beforeUpdate)
    user.password_hash = newPassword;
    await user.save();

    logger.info(`User password successfully updated: ${user.email}`);

    res.json(
      successResponse(null, 'Password changed successfully')
    );
  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
};

module.exports = {
  updateProfile,
  updatePassword
};
