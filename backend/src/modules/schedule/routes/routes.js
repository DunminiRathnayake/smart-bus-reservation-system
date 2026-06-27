/**
 * @file routes.js
 * @description Routes for Schedule module protecting endpoints with auth, authorization, validation, and mapping to controllers.
 */

const express = require('express');
const router = express.Router();

const scheduleController = require('../controller/scheduleController');
const { authenticate, authorize } = require('../../../middleware/auth');
const { createScheduleRules, updateScheduleRules, updateStatusRules } = require('../validation/scheduleValidation');
const validate = require('../../../middleware/validate');

// Protect all schedule routes with JWT authentication and require the ADMIN role globally
router.use(authenticate, authorize('ADMIN'));

/**
 * @route   POST /api/v1/schedules
 * @desc    Create a new schedule (Admin only)
 * @access  Private/Admin
 */
router.post('/', createScheduleRules, validate, scheduleController.createSchedule);

/**
 * @route   GET /api/v1/schedules
 * @desc    Get all schedules (Admin only, supports pagination, searching, filtering, sorting)
 * @access  Private/Admin
 */
router.get('/', scheduleController.getSchedules);

/**
 * @route   GET /api/v1/schedules/:id
 * @desc    Retrieve schedule details by ID (Admin only)
 * @access  Private/Admin
 */
router.get('/:id', scheduleController.getSchedule);

/**
 * @route   PUT /api/v1/schedules/:id
 * @desc    Update schedule details by ID (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', updateScheduleRules, validate, scheduleController.updateSchedule);

/**
 * @route   PATCH /api/v1/schedules/:id/status
 * @desc    Update schedule status by ID (Admin only)
 * @access  Private/Admin
 */
router.patch('/:id/status', updateStatusRules, validate, scheduleController.updateStatus);

/**
 * @route   DELETE /api/v1/schedules/:id
 * @desc    Soft-delete a schedule by ID (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;
