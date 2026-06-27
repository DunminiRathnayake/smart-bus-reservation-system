/**
 * @file routes.js
 * @description Routes for Booking module protecting endpoints with auth, authorization, validation, and mapping to controllers.
 */

const express = require('express');
const router = express.Router();

const bookingController = require('../controller/bookingController');
const { authenticate, authorize } = require('../../../middleware/auth');
const { createBookingRules } = require('../validation/bookingValidation');
const validate = require('../../../middleware/validate');

// Protect all booking routes globally with JWT authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/bookings
 * @desc    Create a new booking (Passenger/Admin)
 * @access  Private
 */
router.post('/', createBookingRules, validate, bookingController.createBooking);

/**
 * @route   GET /api/v1/bookings  OR  GET /api/v1/admin/bookings
 * @desc    Get my bookings (Passenger) OR Get all bookings (Admin only)
 * @access  Private
 */
router.get('/', (req, res, next) => {
  // If the request baseUrl matches the admin mount point, handle as Admin getBookings
  if (req.baseUrl.includes('/admin')) {
    return authorize('ADMIN')(req, res, () => {
      bookingController.getBookings(req, res, next);
    });
  }
  // Otherwise, handle as Passenger getMyBookings
  return bookingController.getMyBookings(req, res, next);
});

/**
 * @route   GET /api/v1/bookings/:id
 * @desc    Retrieve booking details by ID (Owner passenger / Admin)
 * @access  Private
 */
router.get('/:id', bookingController.getBooking);

/**
 * @route   PATCH /api/v1/bookings/:id/cancel
 * @desc    Cancel a booking (Owner passenger / Admin)
 * @access  Private
 */
router.patch('/:id/cancel', bookingController.cancelBooking);

/**
 * @route   DELETE /api/v1/bookings/:id
 * @desc    Soft-delete a booking by ID (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', authorize('ADMIN'), bookingController.deleteBooking);

module.exports = router;
