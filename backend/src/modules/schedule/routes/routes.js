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

// Public endpoints for schedule discovery
router.get('/', scheduleController.getSchedules);
router.get('/:id', scheduleController.getSchedule);

// Admin-only endpoints for configuring schedules
router.post('/', authenticate, authorize('ADMIN'), createScheduleRules, validate, scheduleController.createSchedule);
router.put('/:id', authenticate, authorize('ADMIN'), updateScheduleRules, validate, scheduleController.updateSchedule);
router.patch('/:id/status', authenticate, authorize('ADMIN'), updateStatusRules, validate, scheduleController.updateStatus);
router.delete('/:id', authenticate, authorize('ADMIN'), scheduleController.deleteSchedule);

module.exports = router;
