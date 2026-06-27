/**
 * @file scheduleValidation.js
 * @description Request validation rules for Schedule creation, updates, and status changes using express-validator.
 */

const { body } = require('express-validator');
const ScheduleStatus = require('../../../constants/scheduleStatus');

/**
 * Rules for Schedule creation.
 */
const createScheduleRules = [
  body('scheduleCode')
    .trim()
    .notEmpty()
    .withMessage('Schedule code is required'),

  body('busId')
    .trim()
    .notEmpty()
    .withMessage('Bus ID is required')
    .isMongoId()
    .withMessage('Invalid Bus ID format'),

  body('driverId')
    .trim()
    .notEmpty()
    .withMessage('Driver ID is required')
    .isMongoId()
    .withMessage('Invalid Driver ID format'),

  body('routeId')
    .trim()
    .notEmpty()
    .withMessage('Route ID is required')
    .isMongoId()
    .withMessage('Invalid Route ID format'),

  body('travelDate')
    .notEmpty()
    .withMessage('Travel date is required')
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 travel date'),

  body('departureTime')
    .notEmpty()
    .withMessage('Departure time is required')
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 departure time'),

  body('arrivalTime')
    .notEmpty()
    .withMessage('Arrival time is required')
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 arrival time'),

  body('boardingTime')
    .notEmpty()
    .withMessage('Boarding time is required')
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 boarding time'),

  body('status')
    .optional()
    .trim()
    .isIn(Object.values(ScheduleStatus))
    .withMessage(`Status must be one of: ${Object.values(ScheduleStatus).join(', ')}`)
];

/**
 * Rules for Schedule updates.
 */
const updateScheduleRules = [
  body('scheduleCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Schedule code cannot be empty'),

  body('busId')
    .optional()
    .trim()
    .isMongoId()
    .withMessage('Invalid Bus ID format'),

  body('driverId')
    .optional()
    .trim()
    .isMongoId()
    .withMessage('Invalid Driver ID format'),

  body('routeId')
    .optional()
    .trim()
    .isMongoId()
    .withMessage('Invalid Route ID format'),

  body('travelDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 travel date'),

  body('departureTime')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 departure time'),

  body('arrivalTime')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 arrival time'),

  body('boardingTime')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 boarding time'),

  body('status')
    .optional()
    .trim()
    .isIn(Object.values(ScheduleStatus))
    .withMessage(`Status must be one of: ${Object.values(ScheduleStatus).join(', ')}`)
];

/**
 * Rules for Schedule status updates.
 */
const updateStatusRules = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(ScheduleStatus))
    .withMessage(`Status must be one of: ${Object.values(ScheduleStatus).join(', ')}`)
];

module.exports = {
  createScheduleRules,
  updateScheduleRules,
  updateStatusRules
};
