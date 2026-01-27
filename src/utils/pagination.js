/**
 * Calculate pagination offset
 */
const getOffset = (page, limit) => {
  return (parseInt(page) - 1) * parseInt(limit);
};

/**
 * Get pagination parameters from request query
 */
const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = getOffset(page, limit);

  return { page, limit, offset };
};

/**
 * Build Sequelize order clause from query params
 */
const buildOrderClause = (query) => {
  const sortBy = query.sort_by || 'created_at';
  const sortOrder = query.sort_order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  return [[sortBy, sortOrder]];
};

module.exports = {
  getOffset,
  getPaginationParams,
  buildOrderClause
};
