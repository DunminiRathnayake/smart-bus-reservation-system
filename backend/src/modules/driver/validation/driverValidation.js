/**
 * @file driverValidation.js
 * @description Request validation rules for Driver creation, updates, and status changes using express-validator.
 */

const { body } = require('express-validator');
const Gender = require('../../../constants/gender');
const DriverStatus = require('../../../constants/driverStatus');

/**
 * Rules for Driver creation.
 */
const createDriverRules = [
  body('employeeId')
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required'),

  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number'),

  body('nic')
    .trim()
    .notEmpty()
    .withMessage('NIC is required'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),

  body('gender')
    .trim()
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(Object.values(Gender))
    .withMessage(`Gender must be one of: ${Object.values(Gender).join(', ')}`),

  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 date of birth'),

  body('joiningDate')
    .notEmpty()
    .withMessage('Joining date is required')
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 joining date'),

  body('experienceYears')
    .notEmpty()
    .withMessage('Experience years is required')
    .isInt({ min: 0 })
    .withMessage('Experience years must be an integer greater than or equal to 0'),

  body('licenseNumber')
    .trim()
    .notEmpty()
    .withMessage('License number is required'),

  body('licenseExpiry')
    .notEmpty()
    .withMessage('License expiry date is required')
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 license expiry date'),

  body('profileImage')
    .optional()
    .trim()
    .isURL()
    .withMessage('Profile image must be a valid URL'),

  body('status')
    .optional()
    .trim()
    .isIn(Object.values(DriverStatus))
    .withMessage(`Status must be one of: ${Object.values(DriverStatus).join(', ')}`)
];

/**
 * Rules for Driver updates.
 */
const updateDriverRules = [
  body('employeeId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Employee ID cannot be empty'),

  body('fullName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Full name cannot be empty'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('phoneNumber')
    .optional()
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number'),

  body('nic')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('NIC cannot be empty'),

  body('address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Address cannot be empty'),

  body('gender')
    .optional()
    .trim()
    .isIn(Object.values(Gender))
    .withMessage(`Gender must be one of: ${Object.values(Gender).join(', ')}`),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 date of birth'),

  body('joiningDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 joining date'),

  body('experienceYears')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Experience years must be an integer greater than or equal to 0'),

  body('licenseNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('License number cannot be empty'),

  body('licenseExpiry')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 license expiry date'),

  body('profileImage')
    .optional()
    .trim()
    .isURL()
    .withMessage('Profile image must be a valid URL'),

  body('status')
    .optional()
    .trim()
    .isIn(Object.values(DriverStatus))
    .withMessage(`Status must be one of: ${Object.values(DriverStatus).join(', ')}`)
];

/**
 * Rules for Driver status updates.
 */
const updateStatusRules = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(DriverStatus))
    .withMessage(`Status must be one of: ${Object.values(DriverStatus).join(', ')}`)
];

module.exports = {
  createDriverRules,
  updateDriverRules,
  updateStatusRules
};
