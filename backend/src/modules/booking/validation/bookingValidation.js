/**
 * @file bookingValidation.js
 * @description Request validation rules for Booking creation using express-validator.
 */

const { body } = require('express-validator');

/**
 * Rules for Booking creation.
 */
const createBookingRules = [
  body('scheduleId')
    .trim()
    .notEmpty()
    .withMessage('Schedule ID is required')
    .isMongoId()
    .withMessage('Invalid Schedule ID format'),

  body('seatIds')
    .isArray({ min: 1 })
    .withMessage('seatIds must be an array containing at least one seat ID'),

  body('seatIds.*')
    .trim()
    .isMongoId()
    .withMessage('Invalid Seat ID format in seatIds array'),

  body('passengerName')
    .trim()
    .notEmpty()
    .withMessage('Passenger name is required'),

  body('passengerPhone')
    .trim()
    .notEmpty()
    .withMessage('Passenger phone number is required')
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid passenger phone number'),

  body('passengerEmail')
    .trim()
    .notEmpty()
    .withMessage('Passenger email is required')
    .isEmail()
    .withMessage('Please provide a valid passenger email address')
];

module.exports = {
  createBookingRules
};
