/**
 * @file bookingController.js
 * @description Booking Controller mapping HTTP requests to BookingService actions using standard response helpers.
 */

const bookingService = require('../service/bookingService');
const asyncHandler = require('../../../middleware/asyncHandler');
const { successResponse, paginatedResponse } = require('../../../utils/response');

/**
 * @desc    Create a new booking (Passenger/Admin)
 * @route   POST /api/v1/bookings
 * @access  Private
 */
const createBooking = asyncHandler(async (req, res) => {
  const { booking, ticket } = await bookingService.createBooking(req.body, req.user._id);
  return successResponse(res, 'Booking created successfully', { booking, ticket }, 201);
});

/**
 * @desc    Get all bookings (Admin only)
 * @route   GET /api/v1/admin/bookings
 * @access  Private/Admin
 */
const getBookings = asyncHandler(async (req, res) => {
  const { page, limit, search, bookingStatus, paymentStatus, scheduleId, userId, sortBy } = req.query;
  const result = await bookingService.getBookings({ page, limit, search, bookingStatus, paymentStatus, scheduleId, userId, sortBy });
  
  return paginatedResponse(res, 'Bookings retrieved successfully', 'bookings', result.bookings, result.pagination);
});

/**
 * @desc    Get my bookings (Authenticated passenger)
 * @route   GET /api/v1/bookings
 * @access  Private
 */
const getMyBookings = asyncHandler(async (req, res) => {
  const { page, limit, bookingStatus, paymentStatus, sortBy } = req.query;
  const result = await bookingService.getMyBookings(req.user._id, { page, limit, bookingStatus, paymentStatus, sortBy });
  
  return paginatedResponse(res, 'Your bookings retrieved successfully', 'bookings', result.bookings, result.pagination);
});

/**
 * @desc    Get booking details by ID (Owner passenger / Admin)
 * @route   GET /api/v1/bookings/:id
 * @access  Private
 */
const getBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBooking(req.params.id, req.user._id, req.user.role);
  return successResponse(res, 'Booking details retrieved successfully', { booking });
});

/**
 * @desc    Cancel a booking (Owner passenger / Admin)
 * @route   PATCH /api/v1/bookings/:id/cancel
 * @access  Private
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user._id, req.user.role);
  return successResponse(res, 'Booking cancelled successfully', { booking });
});

/**
 * @desc    Soft-delete a booking by ID (Admin only)
 * @route   DELETE /api/v1/bookings/:id
 * @access  Private/Admin
 */
const deleteBooking = asyncHandler(async (req, res) => {
  await bookingService.deleteBooking(req.params.id, req.user._id);
  return successResponse(res, 'Booking deleted successfully', null);
});

module.exports = {
  createBooking,
  getBookings,
  getMyBookings,
  getBooking,
  cancelBooking,
  deleteBooking
};
