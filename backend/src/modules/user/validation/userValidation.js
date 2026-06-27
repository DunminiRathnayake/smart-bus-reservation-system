/**
 * @file userValidation.js
 * @description Request validation rules for User Profile updates and Administrative user edits using express-validator.
 */

const { body } = require('express-validator');
const Roles = require('../../../constants/roles');
const UserStatus = require('../../../constants/userStatus');

/**
 * Rules for Profile Update (Phase 3A).
 * Permitted fields: fullName, phoneNumber (both optional, but must be valid if provided).
 */
const updateProfileRules = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters long'),

  body('phoneNumber')
    .optional()
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number')
];

/**
 * Rules for Administrative User Update (Phase 3B).
 * Permitted fields: fullName, phoneNumber, role, status (all optional, but must be valid if provided).
 */
const updateUserRules = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters long'),

  body('phoneNumber')
    .optional()
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number'),

  body('role')
    .optional()
    .trim()
    .isIn(Object.values(Roles))
    .withMessage(`Role must be one of: ${Object.values(Roles).join(', ')}`),

  body('status')
    .optional()
    .trim()
    .isIn(Object.values(UserStatus))
    .withMessage(`Status must be one of: ${Object.values(UserStatus).join(', ')}`)
];

/**
 * Rules for Status Update (Phase 3B).
 * Required field: status.
 */
const updateStatusRules = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(UserStatus))
    .withMessage(`Status must be one of: ${Object.values(UserStatus).join(', ')}`)
];

module.exports = {
  updateProfileRules,
  updateUserRules,
  updateStatusRules
};
