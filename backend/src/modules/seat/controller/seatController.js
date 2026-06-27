/**
 * @file seatController.js
 * @description Seat Controller mapping HTTP requests to SeatService actions using standard response helpers.
 */

const seatService = require('../service/seatService');
const asyncHandler = require('../../../middleware/asyncHandler');
const { successResponse } = require('../../../utils/response');

/**
 * @desc    Generate seats for a schedule (Admin only)
 * @route   POST /api/v1/schedules/:scheduleId/seats/generate
 * @access  Private/Admin
 */
const generateSeats = asyncHandler(async (req, res) => {
  const seats = await seatService.generateSeats(req.params.scheduleId);
  return successResponse(res, 'Seats generated successfully', { seats }, 201);
});

/**
 * @desc    Get all seats for a schedule (Admin only, supports filtering by status)
 * @route   GET /api/v1/schedules/:scheduleId/seats
 * @access  Private/Admin
 */
const getSeats = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const seats = await seatService.getSeats(req.params.scheduleId, status);
  return successResponse(res, 'Seats retrieved successfully', { seats });
});

/**
 * @desc    Get seat details by ID (Admin only)
 * @route   GET /api/v1/schedules/:scheduleId/seats/:seatId
 * @access  Private/Admin
 */
const getSeat = asyncHandler(async (req, res) => {
  const seat = await seatService.getSeat(req.params.scheduleId, req.params.seatId);
  return successResponse(res, 'Seat details retrieved successfully', { seat });
});

/**
 * @desc    Update seat status by ID (Admin only)
 * @route   PATCH /api/v1/schedules/:scheduleId/seats/:seatId/status
 * @access  Private/Admin
 */
const updateStatus = asyncHandler(async (req, res) => {
  const seat = await seatService.updateSeatStatus(req.params.scheduleId, req.params.seatId, req.body.status);
  return successResponse(res, `Seat status updated to ${req.body.status.toLowerCase()} successfully`, { seat });
});

/**
 * @desc    Delete all seats for a schedule (Admin only)
 * @route   DELETE /api/v1/schedules/:scheduleId/seats
 * @access  Private/Admin
 */
const deleteSeats = asyncHandler(async (req, res) => {
  await seatService.deleteSeats(req.params.scheduleId);
  return successResponse(res, 'Seats deleted successfully', null);
});

module.exports = {
  generateSeats,
  getSeats,
  getSeat,
  updateStatus,
  deleteSeats
};
