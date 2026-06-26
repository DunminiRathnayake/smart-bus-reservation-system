/**
 * @file asyncHandler.js
 * @description Reusable wrapper to catch errors in asynchronous Express routes
 * and forward them to the global error handling middleware.
 */

/**
 * Wraps an async route handler function.
 * 
 * @param {Function} fn - The asynchronous route handler function.
 * @returns {Function} Express middleware function.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
