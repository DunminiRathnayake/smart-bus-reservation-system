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

// Protect all route endpoints with JWT authentication and require the ADMIN role globally
router.use(authenticate, authorize('ADMIN'));

/**
 * @route   POST /api/v1/routes
 * @desc    Create a new route (Admin only)
 * @access  Private/Admin
 */
router.post('/', createRouteRules, validate, routeController.createRoute);

/**
 * @route   GET /api/v1/routes
 * @desc    Get all routes (Admin only, supports pagination, searching, filtering, sorting)
 * @access  Private/Admin
 */
router.get('/', routeController.getRoutes);

/**
 * @route   GET /api/v1/routes/:id
 * @desc    Retrieve route details by ID (Admin only)
 * @access  Private/Admin
 */
router.get('/:id', routeController.getRoute);

/**
 * @route   PUT /api/v1/routes/:id
 * @desc    Update route details by ID (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', updateRouteRules, validate, routeController.updateRoute);

/**
 * @route   PATCH /api/v1/routes/:id/status
 * @desc    Update route status by ID (Admin only)
 * @access  Private/Admin
 */
router.patch('/:id/status', updateStatusRules, validate, routeController.updateStatus);

/**
 * @route   DELETE /api/v1/routes/:id
 * @desc    Soft-delete a route by ID (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', routeController.deleteRoute);

module.exports = router;
