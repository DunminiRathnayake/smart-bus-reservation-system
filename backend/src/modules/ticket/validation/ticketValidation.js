/**
 * @file ticketValidation.js
 * @description Request validation rules for Ticket endpoints using express-validator.
 */

const { param, body } = require('express-validator');

/**
 * Rules for checking ID parameter.
 */
const idParamRules = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Ticket ID is required')
    .isMongoId()
    .withMessage('Invalid Ticket ID format')
];

/**
 * Rules for validating a ticket (Admin/Conductor scans and updates status).
 */
const validateTicketRules = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Ticket ID is required')
    .isMongoId()
    .withMessage('Invalid Ticket ID format'),
  body('boardingLocation')
    .optional({ nullable: true })
    .trim()
    .notEmpty()
    .withMessage('Boarding location cannot be empty'),
  body('validatedFrom')
    .optional({ nullable: true })
    .trim()
    .notEmpty()
    .withMessage('Validated from location cannot be empty'),
  body('deviceId')
    .optional({ nullable: true })
    .trim()
    .notEmpty()
    .withMessage('Device ID cannot be empty')
];

/**
 * Rules for a future QR ticket scan endpoint POST /tickets/scan.
 */
const scanTicketRules = [
  body('qrPayload')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('QR payload cannot be empty'),
  body('ticketCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Ticket code cannot be empty'),
  body().custom((value, { req }) => {
    if (!req.body.qrPayload && !req.body.ticketCode) {
      throw new Error('Either qrPayload or ticketCode must be provided to perform scan');
    }
    return true;
  })
];

module.exports = {
  idParamRules,
  validateTicketRules,
  scanTicketRules
};
