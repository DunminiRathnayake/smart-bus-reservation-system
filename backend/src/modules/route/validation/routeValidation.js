/**
 * @file routeValidation.js
 * @description Request validation rules for Route creation, updates, and status changes using express-validator.
 */

const { body } = require('express-validator');
const RouteTypes = require('../../../constants/routeTypes');
const RouteStatus = require('../../../constants/routeStatus');

const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

/**
 * Rules for Route creation.
 */
const createRouteRules = [
  body('routeCode')
    .trim()
    .notEmpty()
    .withMessage('Route code is required'),

  body('routeName')
    .trim()
    .notEmpty()
    .withMessage('Route name is required'),

  body('origin')
    .trim()
    .notEmpty()
    .withMessage('Origin is required'),

  body('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination is required'),

  body('type')
    .trim()
    .notEmpty()
    .withMessage('Route type is required')
    .isIn(Object.values(RouteTypes))
    .withMessage(`Route type must be one of: ${Object.values(RouteTypes).join(', ')}`),

  body('color')
    .optional({ nullable: true })
    .trim()
    .matches(hexColorRegex)
    .withMessage('Color must be a valid hex color code (e.g. #1976D2)'),

  body('stops')
    .optional()
    .isArray()
    .withMessage('Stops must be an array'),

  body('stops.*.name')
    .trim()
    .notEmpty()
    .withMessage('Stop name is required'),

  body('stops.*.order')
    .isInt({ min: 1 })
    .withMessage('Stop order must be an integer greater than 0'),

  body('stops.*.distanceFromOrigin')
    .isFloat({ min: 0 })
    .withMessage('Stop distance from origin must be a number greater than or equal to 0'),

  body('stops.*.estimatedArrivalOffset')
    .isInt({ min: 0 })
    .withMessage('Stop estimated arrival offset must be an integer greater than or equal to 0'),

  body('distance')
    .isFloat({ min: 0.01 })
    .withMessage('Distance must be a number greater than zero'),

  body('estimatedDuration')
    .isInt({ min: 1 })
    .withMessage('Estimated duration must be an integer greater than zero'),

  body('baseFare')
    .isFloat({ min: 0.01 })
    .withMessage('Base fare must be a number greater than zero'),

  body('farePerKm')
    .isFloat({ min: 0.01 })
    .withMessage('Fare per km must be a number greater than zero'),

  body('status')
    .optional()
    .trim()
    .isIn(Object.values(RouteStatus))
    .withMessage(`Status must be one of: ${Object.values(RouteStatus).join(', ')}`)
];

/**
 * Rules for Route updates.
 */
const updateRouteRules = [
  body('routeCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Route code cannot be empty'),

  body('routeName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Route name cannot be empty'),

  body('origin')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Origin cannot be empty'),

  body('destination')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Destination cannot be empty'),

  body('type')
    .optional()
    .trim()
    .isIn(Object.values(RouteTypes))
    .withMessage(`Route type must be one of: ${Object.values(RouteTypes).join(', ')}`),

  body('color')
    .optional({ nullable: true })
    .trim()
    .matches(hexColorRegex)
    .withMessage('Color must be a valid hex color code (e.g. #1976D2)'),

  body('stops')
    .optional()
    .isArray()
    .withMessage('Stops must be an array'),

  body('stops.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Stop name cannot be empty'),

  body('stops.*.order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Stop order must be an integer greater than 0'),

  body('stops.*.distanceFromOrigin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Stop distance from origin must be a number greater than or equal to 0'),

  body('stops.*.estimatedArrivalOffset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stop estimated arrival offset must be an integer greater than or equal to 0'),

  body('distance')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Distance must be a number greater than zero'),

  body('estimatedDuration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Estimated duration must be an integer greater than zero'),

  body('baseFare')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Base fare must be a number greater than zero'),

  body('farePerKm')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Fare per km must be a number greater than zero'),

  body('status')
    .optional()
    .trim()
    .isIn(Object.values(RouteStatus))
    .withMessage(`Status must be one of: ${Object.values(RouteStatus).join(', ')}`)
];

/**
 * Rules for Route status updates.
 */
const updateStatusRules = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(RouteStatus))
    .withMessage(`Status must be one of: ${Object.values(RouteStatus).join(', ')}`)
];

module.exports = {
  createRouteRules,
  updateRouteRules,
  updateStatusRules
};
