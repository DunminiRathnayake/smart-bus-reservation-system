/**
 * @file scheduleController.js
 * @description Schedule Controller mapping HTTP requests to ScheduleService actions using standard response helpers.
 */

const scheduleService = require('../service/scheduleService');
const asyncHandler = require('../../../middleware/asyncHandler');
const { successResponse, paginatedResponse } = require('../../../utils/response');

/**
 * @desc    Create a new schedule (Admin only)
 * @route   POST /api/v1/schedules
 * @access  Private/Admin
 */
const createSchedule = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.createSchedule(req.body, req.user._id);
  return successResponse(res, 'Schedule created successfully', { schedule }, 201);
});

/**
 * @desc    Get all schedules (Admin only, supports pagination, searching, filtering, sorting)
 * @route   GET /api/v1/schedules
 * @access  Private/Admin
 */
const getSchedules = asyncHandler(async (req, res) => {
  const { page, limit, search, status, busId, driverId, routeId, travelDate, sortBy } = req.query;
  const result = await scheduleService.getSchedules({ page, limit, search, status, busId, driverId, routeId, travelDate, sortBy });
  
  return paginatedResponse(res, 'Schedules retrieved successfully', 'schedules', result.schedules, result.pagination);
});

/**
 * @desc    Get schedule details by ID (Admin only)
 * @route   GET /api/v1/schedules/:id
 * @access  Private/Admin
 */
const getSchedule = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.getSchedule(req.params.id);
  return successResponse(res, 'Schedule details retrieved successfully', { schedule });
});

/**
 * @desc    Update schedule details by ID (Admin only)
 * @route   PUT /api/v1/schedules/:id
 * @access  Private/Admin
 */
const updateSchedule = asyncHandler(async (req, res) => {
  const updatedSchedule = await scheduleService.updateSchedule(req.params.id, req.body, req.user._id);
  return successResponse(res, 'Schedule details updated successfully', { schedule: updatedSchedule });
});

/**
 * @desc    Update schedule status by ID (Admin only)
 * @route   PATCH /api/v1/schedules/:id/status
 * @access  Private/Admin
 */
const updateStatus = asyncHandler(async (req, res) => {
  const updatedSchedule = await scheduleService.updateScheduleStatus(req.params.id, req.body.status, req.user._id);
  return successResponse(res, `Schedule status updated to ${req.body.status.toLowerCase()} successfully`, { schedule: updatedSchedule });
});

/**
 * @desc    Soft-delete a schedule by ID (Admin only)
 * @route   DELETE /api/v1/schedules/:id
 * @access  Private/Admin
 */
const deleteSchedule = asyncHandler(async (req, res) => {
  await scheduleService.deleteSchedule(req.params.id, req.user._id);
  return successResponse(res, 'Schedule deleted successfully', null);
});

module.exports = {
  createSchedule,
  getSchedules,
  getSchedule,
  updateSchedule,
  updateStatus,
  deleteSchedule
};
