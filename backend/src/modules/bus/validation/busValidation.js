/**
 * @file busValidation.js
 * @description Request validation rules for Bus creation, updates, and status changes using express-validator.
 */

const { body } = require('express-validator');
const BusTypes = require('../../../constants/busTypes');
const BusStatus = require('../../../constants/busStatus');

/**
 * Rules for Bus creation.
 */
const createBusRules = [
  body('busNumber')
    .trim()
    .notEmpty()
    .withMessage('Bus number is required'),

  body('registrationNumber')
    .trim()
    .notEmpty()
    .withMessage('Registration number is required'),

  body('busName')
    .trim()
    .notEmpty()
    .withMessage('Bus name is required'),

  body('type')
    .trim()
    .notEmpty()
    .withMessage('Bus type is required')
    .isIn(Object.values(BusTypes))
    .withMessage(`Bus type must be one of: ${Object.values(BusTypes).join(', ')}`),

  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1 })
    .withMessage('Capacity must be an integer greater than 0'),

  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array')
    .custom((arr) => arr.every(item => typeof item === 'string'))
    .withMessage('Each amenity must be a string'),

  body('status')
    .optional()
    .trim()
    .isIn(Object.values(BusStatus))
    .withMessage(`Status must be one of: ${Object.values(BusStatus).join(', ')}`)
];

/**
 * Rules for Bus updates.
 */
const updateBusRules = [
  body('busNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Bus number cannot be empty'),

  body('registrationNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Registration number cannot be empty'),

  body('busName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Bus name cannot be empty'),

  body('type')
    .optional()
    .trim()
    .isIn(Object.values(BusTypes))
    .withMessage(`Bus type must be one of: ${Object.values(BusTypes).join(', ')}`),

  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be an integer greater than 0'),

  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array')
    .custom((arr) => arr.every(item => typeof item === 'string'))
    .withMessage('Each amenity must be a string'),

  body('status')
    .optional()
    .trim()
    .isIn(Object.values(BusStatus))
    .withMessage(`Status must be one of: ${Object.values(BusStatus).join(', ')}`)
];

/**
 * Rules for Bus status updates.
 */
const updateStatusRules = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(BusStatus))
    .withMessage(`Status must be one of: ${Object.values(BusStatus).join(', ')}`)
];

module.exports = {
  createBusRules,
  updateBusRules,
  updateStatusRules
};
