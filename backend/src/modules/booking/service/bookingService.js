/**
 * @file bookingService.js
 * @description Encapsulates all business logic for Booking Management (Sprint 9).
 */

const bookingRepository = require('../repository/bookingRepository');
const scheduleRepository = require('../../schedule/repository/scheduleRepository');
const seatRepository = require('../../seat/repository/seatRepository');
const routeRepository = require('../../route/repository/routeRepository');
const BookingStatus = require('../../../constants/bookingStatus');
const PaymentStatus = require('../../../constants/paymentStatus');
const SeatStatus = require('../../../constants/seatStatus');

class BookingService {
  /**
   * Helper function to recursively generate a unique, readable booking code.
   * Format: BK-YYYYMMDD-XXXXXX (where XXXXXX is a unique random 6-digit number).
   * 
   * @private
   * @returns {Promise<string>} A unique booking code.
   */
  async _generateUniqueBookingCode() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let unique = false;
    let bookingCode = '';

    while (!unique) {
      const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
      bookingCode = `BK-${dateStr}-${randomDigits}`;
      const codeExists = await bookingRepository.exists(bookingCode);
      if (!codeExists) {
        unique = true;
      }
    }
    return bookingCode;
  }

  /**
   * Creates a new booking, holds seats, and calculates amounts.
   * 
   * @param {Object} bookingData - Booking request payload.
   * @param {string} userId - User creating the booking.
   * @returns {Promise<Object>} The saved booking document.
   */
  async createBooking(bookingData, userId) {
    const { scheduleId, seatIds, passengerName, passengerPhone, passengerEmail } = bookingData;

    // 1. Validation: Verify Schedule exists, is active, and is not in the past
    const schedule = await scheduleRepository.findById(scheduleId);
    const currentTime = new Date();
    if (!schedule || schedule.status === 'CANCELLED' || new Date(schedule.departureTime) < currentTime) {
      const error = new Error('Selected schedule is invalid, cancelled, or has already departed');
      error.statusCode = 400;
      throw error;
    }

    // 2. Validation: Verify Route details for pricing calculations
    const route = await routeRepository.findById(schedule.routeId);
    if (!route) {
      const error = new Error('Route associated with this schedule not found');
      error.statusCode = 400;
      throw error;
    }

    // 3. Validation: Verify every selected seat details
    const validatedSeats = [];
    for (const seatId of seatIds) {
      const seat = await seatRepository.findById(seatId);
      if (!seat) {
        const error = new Error(`Seat with ID ${seatId} not found`);
        error.statusCode = 400;
        throw error;
      }
      if (seat.scheduleId.toString() !== scheduleId.toString()) {
        const error = new Error(`Seat ${seat.seatNumber} does not belong to the selected schedule`);
        error.statusCode = 400;
        throw error;
      }
      if (seat.status !== SeatStatus.AVAILABLE) {
        const error = new Error(`Seat ${seat.seatNumber} is not available (Status: ${seat.status})`);
        error.statusCode = 400;
        throw error;
      }
      validatedSeats.push(seat);
    }

    // 4. Calculate amounts
    const numberOfSeats = seatIds.length;
    const farePerSeat = route.baseFare;
    const totalAmount = farePerSeat * numberOfSeats;

    // 5. Configurable hold expiration time
    const holdMinutes = parseInt(process.env.BOOKING_HOLD_MINUTES) || 10;
    const bookingExpiresAt = new Date(Date.now() + holdMinutes * 60 * 1000);

    // 6. Generate readable booking code
    const bookingCode = await this._generateUniqueBookingCode();

    const payload = {
      bookingCode,
      userId,
      scheduleId,
      seatIds,
      passengerName,
      passengerPhone,
      passengerEmail,
      numberOfSeats,
      farePerSeat,
      totalAmount,
      bookingStatus: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      bookingExpiresAt,
      createdBy: userId
    };

    // TODO: Wrap the following operations inside a single MongoDB transaction:
    // 1. Create the booking document
    // 2. Update seat statuses to HELD
    // 3. Create payment record (Sprint 10)
    
    // Save booking
    const booking = await bookingRepository.create(payload);

    // Mark all selected seats as HELD
    await Promise.all(
      seatIds.map(seatId => seatRepository.updateSeatStatus(scheduleId, seatId, SeatStatus.HELD))
    );

    return booking;
  }

  /**
   * Retrieves booking details by ID. Restricts access to owners and admins.
   * 
   * @param {string} id - Booking ID.
   * @param {string} reqUserId - Authenticated user's ID.
   * @param {string} reqUserRole - Authenticated user's role.
   * @returns {Promise<Object>} The booking document.
   */
  async getBooking(id, reqUserId, reqUserRole) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    // Enforce Access Control: Passenger can only view their own bookings
    if (reqUserRole !== 'ADMIN' && booking.userId.toString() !== reqUserId.toString()) {
      const error = new Error('Access denied. You can only view your own bookings');
      error.statusCode = 403;
      throw error;
    }

    return booking;
  }

  /**
   * Retrieves all bookings (Admin only).
   * 
   * @param {Object} queryOptions - Pagination, searching, filtering, and sorting parameters.
   * @returns {Promise<Object>} List of bookings and pagination metadata.
   */
  async getBookings(queryOptions) {
    return await bookingRepository.findAll(queryOptions);
  }

  /**
   * Retrieves bookings for the authenticated passenger.
   * 
   * @param {string} userId - Passenger's user ID.
   * @param {Object} queryOptions - Pagination and filtering parameters.
   * @returns {Promise<Object>} List of bookings.
   */
  async getMyBookings(userId, queryOptions) {
    const options = {
      ...queryOptions,
      userId
    };
    return await bookingRepository.findAll(options);
  }

  /**
   * Cancels a booking, restoring HELD seats to AVAILABLE.
   * 
   * @param {string} id - Booking ID.
   * @param {string} reqUserId - User performing cancellation.
   * @param {string} reqUserRole - Role of the user performing cancellation.
   * @returns {Promise<Object>} The updated booking document.
   */
  async cancelBooking(id, reqUserId, reqUserRole) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    // Enforce Access Control
    if (reqUserRole !== 'ADMIN' && booking.userId.toString() !== reqUserId.toString()) {
      const error = new Error('Access denied. You can only cancel your own bookings');
      error.statusCode = 403;
      throw error;
    }

    // Check if already cancelled
    if (booking.bookingStatus === BookingStatus.CANCELLED) {
      return booking;
    }

    // Revert held seats back to AVAILABLE
    await Promise.all(
      booking.seatIds.map(async (seat) => {
        if (seat.status === SeatStatus.HELD) {
          await seatRepository.updateSeatStatus(booking.scheduleId, seat._id, SeatStatus.AVAILABLE);
        }
      })
    );

    const updatePayload = {
      bookingStatus: BookingStatus.CANCELLED,
      updatedBy: reqUserId
    };

    const updatedBooking = await bookingRepository.update(id, updatePayload);

    // Resilient booking cancelled notification dispatch
    try {
      const notificationService = require('../../notification/service/notificationService');
      await notificationService.createNotification({
        title: 'Booking Cancelled',
        message: `Your booking ${booking.bookingCode} has been cancelled successfully.`,
        type: 'BOOKING_CANCELLED',
        userId: booking.userId,
        metadata: { bookingId: booking._id }
      });
    } catch (notifError) {
      console.error('Resilient Warning: Booking cancelled but notification dispatch failed:', notifError);
    }

    return updatedBooking;
  }

  /**
   * Soft-deletes a booking record.
   * 
   * @param {string} id - Booking ID.
   * @param {string} deletedById - Admin performing deletion.
   * @returns {Promise<Object>} Soft-deleted booking document.
   */
  async deleteBooking(id, deletedById) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    // If deleting a pending booking, release its HELD seats
    if (booking.bookingStatus === BookingStatus.PENDING) {
      await Promise.all(
        booking.seatIds.map(async (seat) => {
          if (seat.status === SeatStatus.HELD) {
            await seatRepository.updateSeatStatus(booking.scheduleId, seat._id, SeatStatus.AVAILABLE);
          }
        })
      );
    }

    const updatePayload = {
      bookingStatus: BookingStatus.CANCELLED,
      deletedAt: new Date(),
      deletedBy: deletedById
    };

    return await bookingRepository.update(id, updatePayload);
  }
}

module.exports = new BookingService();
