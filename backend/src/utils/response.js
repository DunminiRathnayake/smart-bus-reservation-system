/**
 * @file response.js
 * @description Standard API response formatting helpers for success, error, and paginated data.
 */

/**
 * Sends a standard success API response.
 * 
 * @param {Object} res - Express response object.
 * @param {string} message - Response message.
 * @param {Object|Array|null} [data=null] - Response data payload.
 * @param {number} [statusCode=200] - HTTP status code.
 * @returns {Object} JSON response.
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: []
  });
};

/**
 * Sends a standard error API response.
 * 
 * @param {Object} res - Express response object.
 * @param {string} message - General error message.
 * @param {Array} [errors=[]] - Array of validation/detailed error objects.
 * @param {number} [statusCode=400] - HTTP status code.
 * @returns {Object} JSON response.
 */
const errorResponse = (res, message, errors = [], statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

/**
 * Sends a standard paginated success API response.
 * 
 * @param {Object} res - Express response object.
 * @param {string} message - Response message.
 * @param {string} key - The data key name for the items list (e.g., 'users').
 * @param {Array} items - List of items in the current page.
 * @param {Object} paginationInfo - Pagination metadata.
 * @param {number} paginationInfo.page - Current page.
 * @param {number} paginationInfo.limit - Page items limit.
 * @param {number} paginationInfo.totalItems - Total items across all pages.
 * @param {number} paginationInfo.totalPages - Total pages count.
 * @param {boolean} paginationInfo.hasNext - Flag indicating if next page exists.
 * @param {boolean} paginationInfo.hasPrevious - Flag indicating if previous page exists.
 * @param {number} [statusCode=200] - HTTP status code.
 * @returns {Object} JSON response.
 */
const paginatedResponse = (res, message, key, items, paginationInfo, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      [key]: items,
      pagination: {
        page: paginationInfo.page,
        limit: paginationInfo.limit,
        totalItems: paginationInfo.totalItems,
        totalPages: paginationInfo.totalPages,
        hasNext: paginationInfo.hasNext,
        hasPrevious: paginationInfo.hasPrevious
      }
    }
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse
};
