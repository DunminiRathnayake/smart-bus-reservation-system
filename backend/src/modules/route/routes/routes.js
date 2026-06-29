/**
 * @file routes.js
 * @description Routes for Route module protecting endpoints with auth, authorization, validation, and mapping to controllers.
 */

const express = require('express');
const router = express.Router();

const routeController = require('../controller/routeController');
const { authenticate, authorize } = require('../../../middleware/auth');
const { createRouteRules, updateRouteRules, updateStatusRules } = require('../validation/routeValidation');
const validate = require('../../../middleware/validate');

// Public endpoints for route discovery
router.get('/', routeController.getRoutes);
router.get('/:id', routeController.getRoute);

// Admin-only endpoints for configuring routes
router.post('/', authenticate, authorize('ADMIN'), createRouteRules, validate, routeController.createRoute);
router.put('/:id', authenticate, authorize('ADMIN'), updateRouteRules, validate, routeController.updateRoute);
router.patch('/:id/status', authenticate, authorize('ADMIN'), updateStatusRules, validate, routeController.updateStatus);
router.delete('/:id', authenticate, authorize('ADMIN'), routeController.deleteRoute);

module.exports = router;
