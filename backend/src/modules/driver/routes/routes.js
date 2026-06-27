/**
 * @file routes.js
 * @description Routes for Driver module protecting endpoints with auth, authorization, validation, and mapping to controllers.
 */

const express = require('express');
const router = express.Router();

const driverController = require('../controller/driverController');
const { authenticate, authorize } = require('../../../middleware/auth');
const { createDriverRules, updateDriverRules, updateStatusRules } = require('../validation/driverValidation');
const validate = require('../../../middleware/validate');

// Protect all driver routes with JWT authentication and require the ADMIN role globally
router.use(authenticate, authorize('ADMIN'));

/**
 * @route   POST /api/v1/drivers
 * @desc    Create a new driver (Admin only)
 * @access  Private/Admin
 */
router.post('/', createDriverRules, validate, driverController.createDriver);

/**
 * @route   GET /api/v1/drivers
 * @desc    Get all drivers (Admin only, supports pagination, searching, filtering, sorting)
 * @access  Private/Admin
 */
router.get('/', driverController.getDrivers);

/**
 * @route   GET /api/v1/drivers/:id
 * @desc    Retrieve driver details by ID (Admin only)
 * @access  Private/Admin
 */
router.get('/:id', driverController.getDriver);

/**
 * @route   PUT /api/v1/drivers/:id
 * @desc    Update driver details by ID (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', updateDriverRules, validate, driverController.updateDriver);

/**
 * @route   PATCH /api/v1/drivers/:id/status
 * @desc    Update driver status by ID (Admin only)
 * @access  Private/Admin
 */
router.patch('/:id/status', updateStatusRules, validate, driverController.updateStatus);

/**
 * @route   DELETE /api/v1/drivers/:id
 * @desc    Soft-delete a driver by ID (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', driverController.deleteDriver);

module.exports = router;
