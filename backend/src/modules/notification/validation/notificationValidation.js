/**
 * @file notificationValidation.js
 * @description Request validation rules for Notification endpoints using express-validator.
 */

const { param, body } = require('express-validator');

/**
 * Rules for checking ID parameter.
 */
const idParamRules = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Notification ID is required')
    .isMongoId()
    .withMessage('Invalid Notification ID format')
];

/**
 * Rules for broadcasting system notification.
 */
const broadcastRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Broadcast title is required'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Broadcast message is required')
];

module.exports = {
  idParamRules,
  broadcastRules
};
