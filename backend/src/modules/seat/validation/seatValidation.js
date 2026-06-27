/**
 * @file seatValidation.js
 * @description Request validation rules for Seat operations using express-validator.
 */

const { param, body } = require('express-validator');
const SeatStatus = require('../../../constants/seatStatus');

/**
 * Rules for generating seats.
 */
const generateSeatsRules = [
  param('scheduleId')
    .trim()
    .notEmpty()
    .withMessage('Schedule ID is required')
    .isMongoId()
    .withMessage('Invalid Schedule ID format')
];

/**
 * Rules for getting all seats of a schedule.
 */
const getSeatsRules = [
  param('scheduleId')
    .trim()
    .notEmpty()
    .withMessage('Schedule ID is required')
    .isMongoId()
    .withMessage('Invalid Schedule ID format')
];

/**
 * Rules for retrieving a single seat details.
 */
const getSeatRules = [
  param('scheduleId')
    .trim()
    .notEmpty()
    .withMessage('Schedule ID is required')
    .isMongoId()
    .withMessage('Invalid Schedule ID format'),
  param('seatId')
    .trim()
    .notEmpty()
    .withMessage('Seat ID is required')
    .isMongoId()
    .withMessage('Invalid Seat ID format')
];

/**
 * Rules for updating seat status.
 */
const updateStatusRules = [
  param('scheduleId')
    .trim()
    .notEmpty()
    .withMessage('Schedule ID is required')
    .isMongoId()
    .withMessage('Invalid Schedule ID format'),
  param('seatId')
    .trim()
    .notEmpty()
    .withMessage('Seat ID is required')
    .isMongoId()
    .withMessage('Invalid Seat ID format'),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(SeatStatus))
    .withMessage(`Status must be one of: ${Object.values(SeatStatus).join(', ')}`)
];

/**
 * Rules for deleting all seats of a schedule.
 */
const deleteSeatsRules = [
  param('scheduleId')
    .trim()
    .notEmpty()
    .withMessage('Schedule ID is required')
    .isMongoId()
    .withMessage('Invalid Schedule ID format')
];

module.exports = {
  generateSeatsRules,
  getSeatsRules,
  getSeatRules,
  updateStatusRules,
  deleteSeatsRules
};
