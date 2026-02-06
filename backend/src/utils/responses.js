/**
 * Standard API response format
 */
const successResponse = (data, message = 'Success', meta = {}) => {
  return {
    success: true,
    message,
    data,
    ...(Object.keys(meta).length > 0 && { meta })
  };
};

/**
 * Standard error response format
 */
const errorResponse = (code, message, details = null) => {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    }
  };
};

/**
 * Pagination metadata
 */
const paginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

module.exports = {
  successResponse,
  errorResponse,
  paginationMeta
};
