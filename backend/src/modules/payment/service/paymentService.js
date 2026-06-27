/**
 * @file paymentService.js
 * @description Encapsulates all business logic for Payment Management (Sprint 10).
 */

const paymentRepository = require('../repository/paymentRepository');
const bookingRepository = require('../../booking/repository/bookingRepository');
const Booking = require('../../booking/model/Booking');
const Seat = require('../../seat/model/Seat');
const Payment = require('../model/Payment');
const PaymentTransactionStatus = require('../../../constants/paymentTransactionStatus');
const BookingStatus = require('../../../constants/bookingStatus');
const PaymentStatus = require('../../../constants/paymentStatus');
const SeatStatus = require('../../../constants/seatStatus');
const PaymentGateway = require('../../../constants/paymentGateway');

class PaymentService {
  /**
   * Helper function to recursively generate a unique, readable payment code.
   * Format: PM-YYYYMMDD-XXXXXX (where XXXXXX is a unique random 6-digit number).
   * 
   * @private
   * @returns {Promise<string>} A unique payment code.
   */
  async _generateUniquePaymentCode() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let unique = false;
    let paymentCode = '';

    while (!unique) {
      const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
      paymentCode = `PM-${dateStr}-${randomDigits}`;
      const codeExists = await Payment.exists({ paymentCode, deletedAt: null });
      if (!codeExists) {
        unique = true;
      }
    }
    return paymentCode;
  }

  /**
   * Registers a new PENDING payment transaction.
   * 
   * @param {Object} paymentData - Payment details.
   * @param {string} userId - Authenticated user's ID.
   * @param {string} userRole - Authenticated user's role.
   * @returns {Promise<Object>} The pending Payment document.
   */
  async createPayment(paymentData, userId, userRole) {
    const { bookingId, amount, paymentMethod, currency = 'LKR' } = paymentData;

    // 1. Validation: Verify booking exists
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Validation: Booking belongs to authenticated passenger unless admin
    if (userRole !== 'ADMIN' && booking.userId.toString() !== userId.toString()) {
      const error = new Error('Access denied. You can only pay for your own bookings');
      error.statusCode = 403;
      throw error;
    }

    // 3. Validation: Booking is PENDING
    if (booking.bookingStatus !== BookingStatus.PENDING) {
      const error = new Error(`Payment rejected. Booking status is ${booking.bookingStatus.toLowerCase()}`);
      error.statusCode = 400;
      throw error;
    }

    // 4. Validation: Reject expired bookings
    if (new Date(booking.bookingExpiresAt) < new Date()) {
      const error = new Error('Payment rejected. Booking hold time has expired');
      error.statusCode = 400;
      throw error;
    }

    // 5. Validation: Reject duplicate successful payments
    const existingPayments = await paymentRepository.findByBooking(bookingId);
    const successfulPaymentExists = existingPayments.some(
      p => p.paymentStatus === PaymentTransactionStatus.SUCCESS
    );
    if (successfulPaymentExists) {
      const error = new Error('Payment rejected. This booking has already been paid for');
      error.statusCode = 400;
      throw error;
    }

    // 6. Validation: Check payment amount matches booking.totalAmount
    if (Math.abs(amount - booking.totalAmount) > 0.01) {
      const error = new Error(`Payment rejected. Incorrect amount. Expected: ${booking.totalAmount}`);
      error.statusCode = 400;
      throw error;
    }

    // 7. Generate readable payment code
    const paymentCode = await this._generateUniquePaymentCode();

    const payload = {
      paymentCode,
      bookingId,
      userId,
      amount,
      currency,
      paymentMethod,
      gateway: PaymentGateway.SIMULATED,
      paymentStatus: PaymentTransactionStatus.PENDING,
      createdBy: userId
    };

    return await paymentRepository.create(payload);
  }

  /**
   * Confirms payment success and updates booking and seats statuses.
   * 
   * @param {string} paymentId - Payment ID.
   * @param {string} transactionReference - Transaction reference from gateway.
   * @param {Object} [metadata={}] - Optional metadata.
   * @returns {Promise<Object>} The updated Payment document.
   */
  async confirmPayment(paymentId, transactionReference, metadata = {}) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) {
      const error = new Error('Payment not found');
      error.statusCode = 404;
      throw error;
    }

    const booking = await bookingRepository.findById(payment.bookingId);
    if (!booking) {
      const error = new Error('Associated booking not found');
      error.statusCode = 404;
      throw error;
    }

    // TODO: Wrap the following updates inside a single MongoDB transaction:
    // 1. Update Payment status to SUCCESS
    // 2. Update Booking status to CONFIRMED and paymentStatus to PAID
    // 3. Update all seats from HELD to BOOKED

    // Update payment details
    const updatedPayment = await paymentRepository.update(paymentId, {
      paymentStatus: PaymentTransactionStatus.SUCCESS,
      transactionReference,
      paidAt: new Date(),
      metadata: { ...payment.metadata, ...metadata }
    });

    // Update booking status
    await Booking.findByIdAndUpdate(payment.bookingId, {
      bookingStatus: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID
    });

    // Transition all seats from HELD to BOOKED and assign bookingId/passengerId
    await Promise.all(
      booking.seatIds.map(async (seat) => {
        await Seat.findOneAndUpdate(
          { _id: seat._id, scheduleId: booking.scheduleId },
          {
            status: SeatStatus.BOOKED,
            bookingId: booking._id,
            passengerId: booking.userId
          }
        );
      })
    );

    return updatedPayment;
  }

  /**
   * Fails a payment transaction.
   * 
   * @param {string} paymentId - Payment ID.
   * @param {string} failureReason - Failure reason text.
   * @returns {Promise<Object>} The updated Payment document.
   */
  async failPayment(paymentId, failureReason) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) {
      const error = new Error('Payment not found');
      error.statusCode = 404;
      throw error;
    }

    return await paymentRepository.update(paymentId, {
      paymentStatus: PaymentTransactionStatus.FAILED,
      failureReason
    });
  }

  /**
   * Simulates payment processing via simulated gateway.
   * 
   * @param {string} paymentId - Payment ID.
   * @param {boolean} [isSuccess=true] - Simulated success or failure.
   * @returns {Promise<Object>} The updated Payment document.
   */
  async simulatePayment(paymentId, isSuccess = true) {
    // TODO: Integrate actual Payment Gateway API (e.g. Stripe, Payhere) here later.
    
    if (isSuccess) {
      const randomRef = 'TXN-SIM-' + Math.floor(100000 + Math.random() * 900000);
      return await this.confirmPayment(paymentId, randomRef, { simulated: true });
    } else {
      return await this.failPayment(paymentId, 'Simulated payment processing failed');
    }
  }

  /**
   * Refunds a successful payment and cancels booking and seats.
   * 
   * @param {string} paymentId - Payment ID.
   * @param {string} updatedById - Admin performing the refund.
   * @returns {Promise<Object>} The refunded Payment document.
   */
  async refundPayment(paymentId, updatedById) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) {
      const error = new Error('Payment not found');
      error.statusCode = 404;
      throw error;
    }

    if (payment.paymentStatus !== PaymentTransactionStatus.SUCCESS) {
      const error = new Error('Only successful payments can be refunded');
      error.statusCode = 400;
      throw error;
    }

    const booking = await bookingRepository.findById(payment.bookingId);
    if (!booking) {
      const error = new Error('Associated booking not found');
      error.statusCode = 404;
      throw error;
    }

    // TODO: Wrap the following updates inside a single MongoDB transaction:
    // 1. Update Payment status to REFUNDED
    // 2. Update Booking status to CANCELLED and paymentStatus to REFUNDED
    // 3. Update all seats status to AVAILABLE

    // Update payment details
    const updatedPayment = await paymentRepository.update(paymentId, {
      paymentStatus: PaymentTransactionStatus.REFUNDED,
      updatedBy: updatedById
    });

    // Update booking status
    await Booking.findByIdAndUpdate(payment.bookingId, {
      bookingStatus: BookingStatus.CANCELLED,
      paymentStatus: PaymentStatus.REFUNDED,
      updatedBy: updatedById
    });

    // Release all booked seats back to AVAILABLE
    await Promise.all(
      booking.seatIds.map(async (seat) => {
        await Seat.findOneAndUpdate(
          { _id: seat._id, scheduleId: booking.scheduleId },
          {
            status: SeatStatus.AVAILABLE,
            bookingId: null,
            passengerId: null
          }
        );
      })
    );

    return updatedPayment;
  }

  /**
   * Retrieves payment details by ID. Restricts access to owners and admins.
   * 
   * @param {string} id - Payment ID.
   * @param {string} reqUserId - Authenticated user's ID.
   * @param {string} reqUserRole - Authenticated user's role.
   * @returns {Promise<Object>} The payment document.
   */
  async getPayment(id, reqUserId, reqUserRole) {
    const payment = await paymentRepository.findById(id);
    if (!payment) {
      const error = new Error('Payment not found');
      error.statusCode = 404;
      throw error;
    }

    // Passenger can only view their own payments
    if (reqUserRole !== 'ADMIN' && payment.userId.toString() !== reqUserId.toString()) {
      const error = new Error('Access denied. You can only view your own payments');
      error.statusCode = 403;
      throw error;
    }

    return payment;
  }

  /**
   * Retrieves all payments (Admin only).
   * 
   * @param {Object} queryOptions - Pagination, searching, filtering, and sorting parameters.
   * @returns {Promise<Object>} List of payments and pagination metadata.
   */
  async getPayments(queryOptions) {
    return await paymentRepository.findAll(queryOptions);
  }

  /**
   * Retrieves payments for the authenticated passenger.
   * 
   * @param {string} userId - Passenger's user ID.
   * @param {Object} queryOptions - Pagination parameters.
   * @returns {Promise<Object>} List of payments.
   */
  async getMyPayments(userId, queryOptions) {
    const options = {
      ...queryOptions,
      userId
    };
    return await paymentRepository.findAll(options);
  }
}

module.exports = new PaymentService();
