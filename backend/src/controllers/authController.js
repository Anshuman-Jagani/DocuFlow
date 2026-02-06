const { User } = require('../models');
const { generateTokens, verifyRefreshToken } = require('../config/jwt');
const { successResponse, errorResponse } = require('../utils/responses');
const logger = require('../utils/logger');

/**
 * Register new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { email, password, full_name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(409).json(
        errorResponse('USER_EXISTS', 'User with this email already exists')
      );
    }

    // Create new user (password will be hashed by model hook)
    const user = await User.create({
      email,
      password_hash: password, // Will be hashed by beforeCreate hook
      full_name,
      role: role || 'user'
    });

    // Generate tokens
    const tokens = generateTokens(user);

    logger.info(`New user registered: ${email}`);

    res.status(201).json(
      successResponse(
        {
          user: user.toSafeObject(),
          ...tokens
        },
        'User registered successfully'
      )
    );
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json(
        errorResponse('INVALID_CREDENTIALS', 'Invalid email or password')
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json(
        errorResponse('INVALID_CREDENTIALS', 'Invalid email or password')
      );
    }

    // Generate tokens
    const tokens = generateTokens(user);

    logger.info(`User logged in: ${email}`);

    res.json(
      successResponse(
        {
          user: user.toSafeObject(),
          ...tokens
        },
        'Login successful'
      )
    );
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // by removing the token. This endpoint is here for consistency
    // and can be extended to implement token blacklisting if needed.

    logger.info(`User logged out: ${req.user?.email || 'unknown'}`);

    res.json(
      successResponse(null, 'Logout successful')
    );
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res, next) => {
  try {
    // User is already attached to req by authenticate middleware
    res.json(
      successResponse(
        req.user.toSafeObject(),
        'User retrieved successfully'
      )
    );
  } catch (error) {
    logger.error('Get current user error:', error);
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Get user
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json(
        errorResponse('USER_NOT_FOUND', 'User not found')
      );
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    logger.info(`Token refreshed for user: ${user.email}`);

    res.json(
      successResponse(
        tokens,
        'Token refreshed successfully'
      )
    );
  } catch (error) {
    logger.error('Refresh token error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json(
        errorResponse('INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token')
      );
    }
    
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  refreshToken
};
