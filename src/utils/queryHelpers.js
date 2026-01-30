const { Op } = require('sequelize');

/**
 * Build date range filter for Sequelize where clause
 * @param {string} field - Field name to filter
 * @param {string} startDate - Start date (ISO format)
 * @param {string} endDate - End date (ISO format)
 * @returns {Object} Sequelize where clause
 */
const buildDateRangeFilter = (field, startDate, endDate) => {
  const filter = {};
  
  if (startDate && endDate) {
    filter[field] = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
  } else if (startDate) {
    filter[field] = {
      [Op.gte]: new Date(startDate)
    };
  } else if (endDate) {
    filter[field] = {
      [Op.lte]: new Date(endDate)
    };
  }
  
  return filter;
};

/**
 * Build search filter using ILIKE (case-insensitive)
 * @param {string|Array} fields - Field name(s) to search
 * @param {string} searchTerm - Search term
 * @returns {Object} Sequelize where clause
 */
const buildSearchFilter = (fields, searchTerm) => {
  if (!searchTerm) return {};
  
  const fieldsArray = Array.isArray(fields) ? fields : [fields];
  
  if (fieldsArray.length === 1) {
    return {
      [fieldsArray[0]]: {
        [Op.iLike]: `%${searchTerm}%`
      }
    };
  }
  
  // Multiple fields - use OR
  return {
    [Op.or]: fieldsArray.map(field => ({
      [field]: {
        [Op.iLike]: `%${searchTerm}%`
      }
    }))
  };
};

/**
 * Build JSONB field filter
 * @param {string} field - JSONB field name
 * @param {string} path - JSON path (e.g., 'skills.technical')
 * @param {any} value - Value to match
 * @returns {Object} Sequelize where clause
 */
const buildJsonbFilter = (field, path, value) => {
  if (!value) return {};
  
  // For array contains operations
  if (Array.isArray(value)) {
    return {
      [field]: {
        [Op.contains]: value
      }
    };
  }
  
  // For exact match on nested field
  return {
    [field]: {
      [Op.contains]: { [path]: value }
    }
  };
};

/**
 * Build status/enum filter
 * @param {string} field - Field name
 * @param {string|Array} values - Status value(s)
 * @returns {Object} Sequelize where clause
 */
const buildStatusFilter = (field, values) => {
  if (!values) return {};
  
  if (Array.isArray(values)) {
    return {
      [field]: {
        [Op.in]: values
      }
    };
  }
  
  return { [field]: values };
};

/**
 * Build numeric range filter
 * @param {string} field - Field name
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {Object} Sequelize where clause
 */
const buildNumericRangeFilter = (field, min, max) => {
  const filter = {};
  
  if (min !== undefined && max !== undefined) {
    filter[field] = {
      [Op.between]: [parseFloat(min), parseFloat(max)]
    };
  } else if (min !== undefined) {
    filter[field] = {
      [Op.gte]: parseFloat(min)
    };
  } else if (max !== undefined) {
    filter[field] = {
      [Op.lte]: parseFloat(max)
    };
  }
  
  return filter;
};

/**
 * Build complete where clause from query parameters
 * @param {Object} query - Express request query object
 * @param {Object} config - Configuration object with field mappings
 * @returns {Object} Sequelize where clause
 */
const buildWhereClause = (query, config = {}) => {
  const where = {};
  
  // Apply each configured filter
  Object.entries(config).forEach(([key, filterConfig]) => {
    const value = query[key];
    if (!value) return;
    
    switch (filterConfig.type) {
      case 'exact':
        where[filterConfig.field] = value;
        break;
      case 'status':
        Object.assign(where, buildStatusFilter(filterConfig.field, value));
        break;
      case 'search':
        Object.assign(where, buildSearchFilter(filterConfig.fields, value));
        break;
      case 'dateRange':
        Object.assign(where, buildDateRangeFilter(
          filterConfig.field,
          query[filterConfig.startParam],
          query[filterConfig.endParam]
        ));
        break;
      case 'numericRange':
        Object.assign(where, buildNumericRangeFilter(
          filterConfig.field,
          query[filterConfig.minParam],
          query[filterConfig.maxParam]
        ));
        break;
      case 'jsonb':
        Object.assign(where, buildJsonbFilter(
          filterConfig.field,
          filterConfig.path,
          value
        ));
        break;
    }
  });
  
  return where;
};

module.exports = {
  buildDateRangeFilter,
  buildSearchFilter,
  buildJsonbFilter,
  buildStatusFilter,
  buildNumericRangeFilter,
  buildWhereClause
};
