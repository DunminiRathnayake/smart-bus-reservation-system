/**
 * @file routes.js
 * @description Routes for Bus module protecting endpoints with auth, authorization, validation, and mapping to controllers.
 */

const express = require('express');
const router = express.Router();

const busController = require('../controller/busController');
const { authenticate, authorize } = require('../../../middleware/auth');
const { createBusRules, updateBusRules, updateStatusRules } = require('../validation/busValidation');
const validate = require('../../../middleware/validate');

// Protect all bus routes with JWT authentication and require the ADMIN role globally
router.use(authenticate, authorize('ADMIN'));

/**
 * @route   POST /api/v1/buses
 * @desc    Create a new bus (Admin only)
 * @access  Private/Admin
 */
router.post('/', createBusRules, validate, busController.createBus);

/**
 * @route   GET /api/v1/buses
 * @desc    Get all buses (Admin only, supports pagination, searching, filtering, sorting)
 * @access  Private/Admin
 */
router.get('/', busController.getBuses);

/**
 * @route   GET /api/v1/buses/:id
 * @desc    Retrieve bus details by ID (Admin only)
 * @access  Private/Admin
 */
router.get('/:id', busController.getBus);

/**
 * @route   PUT /api/v1/buses/:id
 * @desc    Update bus details by ID (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', updateBusRules, validate, busController.updateBus);

/**
 * @route   PATCH /api/v1/buses/:id/status
 * @desc    Update bus status by ID (Admin only)
 * @access  Private/Admin
 */
router.patch('/:id/status', updateStatusRules, validate, busController.updateStatus);

/**
 * @route   DELETE /api/v1/buses/:id
 * @desc    Soft-delete a bus by ID (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', busController.deleteBus);

module.exports = router;
