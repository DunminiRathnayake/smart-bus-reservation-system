/**
 * @file paymentValidation.js
 * @description Request validation rules for Payment creation using express-validator.
 */

const { body } = require('express-validator');
const PaymentMethod = require('../../../constants/paymentMethod');

/**
 * Rules for Payment creation.
 */
const createPaymentRules = [
  body('bookingId')
    .trim()
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid Booking ID format'),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a number greater than zero'),

  body('paymentMethod')
    .trim()
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(Object.values(PaymentMethod))
    .withMessage(`Payment method must be one of: ${Object.values(PaymentMethod).join(', ')}`),

  body('currency')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Currency cannot be empty')
];

module.exports = {
  createPaymentRules
};
