/**
 * @file routes.js
 * @description Routes for Seat module protecting endpoints with auth, authorization, validation, and mapping to controllers.
 */

const express = require('express');
const router = express.Router();

const seatController = require('../controller/seatController');
const { authenticate, authorize } = require('../../../middleware/auth');
const {
  generateSeatsRules,
  getSeatsRules,
  getSeatRules,
  updateStatusRules,
  deleteSeatsRules
} = require('../validation/seatValidation');
const validate = require('../../../middleware/validate');

// Protect all seat endpoints with JWT authentication and require the ADMIN role globally
router.use(authenticate, authorize('ADMIN'));

/**
 * @route   POST /api/v1/schedules/:scheduleId/seats/generate
 * @desc    Generate seats for a schedule (Admin only)
 * @access  Private/Admin
 */
router.post('/:scheduleId/seats/generate', generateSeatsRules, validate, seatController.generateSeats);

/**
 * @route   GET /api/v1/schedules/:scheduleId/seats
 * @desc    Get all seats for a schedule (Admin only, supports filtering by status)
 * @access  Private/Admin
 */
router.get('/:scheduleId/seats', getSeatsRules, validate, seatController.getSeats);

/**
 * @route   GET /api/v1/schedules/:scheduleId/seats/:seatId
 * @desc    Retrieve seat details by ID (Admin only)
 * @access  Private/Admin
 */
router.get('/:scheduleId/seats/:seatId', getSeatRules, validate, seatController.getSeat);

/**
 * @route   PATCH /api/v1/schedules/:scheduleId/seats/:seatId/status
 * @desc    Update seat status by ID (Admin only)
 * @access  Private/Admin
 */
router.patch('/:scheduleId/seats/:seatId/status', updateStatusRules, validate, seatController.updateStatus);

/**
 * @route   DELETE /api/v1/schedules/:scheduleId/seats
 * @desc    Delete all seats for a schedule (Admin only)
 * @access  Private/Admin
 */
router.delete('/:scheduleId/seats', deleteSeatsRules, validate, seatController.deleteSeats);

module.exports = router;
