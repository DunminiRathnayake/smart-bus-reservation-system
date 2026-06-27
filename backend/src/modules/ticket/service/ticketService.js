/**
 * @file ticketService.js
 * @description Encapsulates all business logic for Ticket Management (Sprint 11).
 */

const crypto = require('crypto');
const ticketRepository = require('../repository/ticketRepository');
const bookingRepository = require('../../booking/repository/bookingRepository');
const Ticket = require('../model/Ticket');
const TicketStatus = require('../../../constants/ticketStatus');

class TicketService {
  /**
   * Helper function to recursively generate a unique, readable ticket code.
   * Format: TK-YYYYMMDD-XXXXXX (where XXXXXX is a unique random 6-digit number).
   * 
   * @private
   * @returns {Promise<string>} A unique ticket code.
   */
  async _generateUniqueTicketCode() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let unique = false;
    let ticketCode = '';

    while (!unique) {
      const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
      ticketCode = `TK-${dateStr}-${randomDigits}`;
      const codeExists = await Ticket.exists({ ticketCode, deletedAt: null });
      if (!codeExists) {
        unique = true;
      }
    }
    return ticketCode;
  }

  /**
   * Reusable QR code image generator placeholder.
   * Returns a simulated URL for the QR code representation.
   * 
   * @param {string} qrPayload - The payload to encode in the QR code.
   * @returns {string} Simulated QR code image URL.
   */
  generateQrCodeImage(qrPayload) {
    // TODO: Integrate a real QR code library (e.g. qrcode) to output actual QR image streams or base64 data.
    const encodedPayload = encodeURIComponent(qrPayload);
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedPayload}`;
  }

  /**
   * Generates a new ticket after a successful payment transaction.
   * 
   * @param {string} bookingId - Booking ID.
   * @param {string} paymentId - Payment ID.
   * @param {string} userId - User creating the ticket.
   * @returns {Promise<Object>} The issued Ticket document.
   */
  async generateTicket(bookingId, paymentId, userId) {
    // 1. Validation: Verify no ticket already exists for the booking
    const ticketExists = await ticketRepository.findByBooking(bookingId);
    if (ticketExists) {
      const error = new Error('A ticket has already been generated for this booking');
      error.statusCode = 400;
      throw error;
    }

    // 2. Fetch Booking details
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    // 3. Generate readable ticket code
    const ticketCode = await this._generateUniqueTicketCode();
    const issuedAt = new Date();

    // 4. Generate rich QR payload containing ticket details
    const qrPayloadObj = {
      ticketCode,
      bookingCode: booking.bookingCode,
      scheduleId: booking.scheduleId._id.toString(),
      issuedAt: issuedAt.toISOString(),
      version: '1.0'
    };
    const qrPayload = JSON.stringify(qrPayloadObj);

    // 5. Generate SHA256 integrity hash for future validation checks
    const qrHash = crypto.createHash('sha256').update(qrPayload).digest('hex');

    const payload = {
      ticketCode,
      bookingId,
      paymentId,
      userId: booking.userId,
      scheduleId: booking.scheduleId._id,
      seatIds: booking.seatIds.map(s => s._id),
      qrPayload,
      qrHash,
      ticketStatus: TicketStatus.ACTIVE,
      issuedAt,
      createdBy: userId
    };

    const ticket = await ticketRepository.create(payload);

    // TODO: Generate PDF ticket document
    // TODO: Send ticket email delivery to passenger
    // TODO: Send SMS/WhatsApp alerts for the ticket details
    // TODO: Google Wallet integration for mobile ticketing
    // TODO: Apple Wallet integration (.pkpass file compilation)

    return ticket;
  }

  /**
   * Retrieves ticket details by ID. Restricts access to owners and admins.
   * 
   * @param {string} ticketId - Ticket ID.
   * @param {string} reqUserId - Authenticated user's ID.
   * @param {string} reqUserRole - Authenticated user's role.
   * @returns {Promise<Object>} The ticket document.
   */
  async getTicket(ticketId, reqUserId, reqUserRole) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      const error = new Error('Ticket not found');
      error.statusCode = 404;
      throw error;
    }

    // Access Control: Passengers can only view their own tickets
    if (reqUserRole !== 'ADMIN' && ticket.userId._id.toString() !== reqUserId.toString()) {
      const error = new Error('Access denied. You can only view your own tickets');
      error.statusCode = 403;
      throw error;
    }

    return ticket;
  }

  /**
   * Retrieves all tickets (Admin only).
   * 
   * @param {Object} queryOptions - Pagination, searching, filtering, and sorting parameters.
   * @returns {Promise<Object>} List of tickets and pagination metadata.
   */
  async getTickets(queryOptions) {
    return await ticketRepository.findAll(queryOptions);
  }

  /**
   * Retrieves tickets for the authenticated passenger.
   * 
   * @param {string} userId - Passenger's user ID.
   * @param {Object} queryOptions - Pagination and filtering parameters.
   * @returns {Promise<Object>} List of tickets.
   */
  async getMyTickets(userId, queryOptions) {
    const options = {
      ...queryOptions,
      userId
    };
    return await ticketRepository.findAll(options);
  }

  /**
   * Validates a ticket (Admin/Conductor scans and marks it as USED).
   * 
   * @param {string} ticketId - Ticket ID.
   * @param {string} validatedById - The conductor/admin validating the ticket.
   * @param {Object} auditData - Validation metadata (boardingLocation, validatedFrom, deviceId).
   * @returns {Promise<Object>} The updated Ticket document.
   */
  async validateTicket(ticketId, validatedById, auditData = {}) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      const error = new Error('Ticket not found');
      error.statusCode = 404;
      throw error;
    }

    // Check states: Reject if not ACTIVE
    if (ticket.ticketStatus === TicketStatus.USED) {
      const error = new Error('Ticket has already been validated and used');
      error.statusCode = 400;
      throw error;
    }
    if (ticket.ticketStatus === TicketStatus.CANCELLED) {
      const error = new Error('Ticket has been cancelled and is invalid');
      error.statusCode = 400;
      throw error;
    }
    if (ticket.ticketStatus === TicketStatus.EXPIRED) {
      const error = new Error('Ticket has expired and is invalid');
      error.statusCode = 400;
      throw error;
    }
    if (ticket.ticketStatus !== TicketStatus.ACTIVE) {
      const error = new Error(`Ticket validation rejected. Ticket status is ${ticket.ticketStatus.toLowerCase()}`);
      error.statusCode = 400;
      throw error;
    }

    const { boardingLocation = null, validatedFrom = null, deviceId = null } = auditData;

    const updatePayload = {
      ticketStatus: TicketStatus.USED,
      validatedAt: new Date(),
      validatedBy: validatedById,
      boardingLocation,
      validatedFrom,
      deviceId,
      updatedBy: validatedById
    };

    return await ticketRepository.update(ticketId, updatePayload);
  }

  /**
   * Cancels a ticket.
   * 
   * @param {string} ticketId - Ticket ID.
   * @param {string} reqUserId - User performing cancellation.
   * @returns {Promise<Object>} The updated Ticket document.
   */
  async cancelTicket(ticketId, reqUserId) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      const error = new Error('Ticket not found');
      error.statusCode = 404;
      throw error;
    }

    return await ticketRepository.update(ticketId, {
      ticketStatus: TicketStatus.CANCELLED,
      updatedBy: reqUserId
    });
  }

  /**
   * Automatically expires active tickets if the travel date has passed.
   * 
   * @param {string} ticketId - Ticket ID.
   * @returns {Promise<Object>} The updated Ticket document.
   */
  async expireTicket(ticketId) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      const error = new Error('Ticket not found');
      error.statusCode = 404;
      throw error;
    }

    if (ticket.ticketStatus !== TicketStatus.ACTIVE) {
      return ticket;
    }

    const travelDate = new Date(ticket.scheduleId.travelDate);
    const today = new Date();
    // Reset hours to start of day for comparison
    travelDate.setHours(23, 59, 59, 999); // Expire at the end of the travel day

    if (travelDate < today) {
      return await ticketRepository.update(ticketId, {
        ticketStatus: TicketStatus.EXPIRED
      });
    }

    return ticket;
  }
}

module.exports = new TicketService();
