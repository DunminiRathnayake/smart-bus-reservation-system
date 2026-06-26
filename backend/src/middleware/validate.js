/**
 * @file validate.js
 * @description Reusable validation middleware that checks for express-validator results
 * and returns errors formatted in a standard API response structure.
 */

const { validationResult } = require('express-validator');

/**
 * Middleware to intercept validation errors and format the response.
 * 
 * Response Format:
 * {
 *   success: false,
 *   message: "Validation failed: [first error detail]",
 *   errors: [
 *     { field: "email", message: "Invalid email format" }
 *   ]
 * }
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      message: formattedErrors[0].message || 'Validation failed',
      errors: formattedErrors
    });
  }
  next();
};

module.exports = validate;
