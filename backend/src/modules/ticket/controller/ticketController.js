/**
 * @file ticketController.js
 * @description Ticket Controller mapping HTTP requests to TicketService actions using standard response helpers.
 */

const ticketService = require('../service/ticketService');
const asyncHandler = require('../../../middleware/asyncHandler');
const { successResponse, paginatedResponse } = require('../../../utils/response');

/**
 * @desc    Get all tickets (Admin only)
 * @route   GET /api/v1/admin/tickets
 * @access  Private/Admin
 */
const getTickets = asyncHandler(async (req, res) => {
  const { page, limit, search, ticketStatus, bookingId, userId, scheduleId, sortBy } = req.query;
  const result = await ticketService.getTickets({ page, limit, search, ticketStatus, bookingId, userId, scheduleId, sortBy });
  
  return paginatedResponse(res, 'Tickets retrieved successfully', 'tickets', result.tickets, result.pagination);
});

/**
 * @desc    Get my tickets (Authenticated passenger)
 * @route   GET /api/v1/tickets
 * @access  Private
 */
const getMyTickets = asyncHandler(async (req, res) => {
  const { page, limit, ticketStatus, scheduleId, sortBy } = req.query;
  const result = await ticketService.getMyTickets(req.user._id, { page, limit, ticketStatus, scheduleId, sortBy });
  
  return paginatedResponse(res, 'Your tickets retrieved successfully', 'tickets', result.tickets, result.pagination);
});

/**
 * @desc    Get ticket details by ID (Owner passenger / Admin)
 * @route   GET /api/v1/tickets/:id
 * @access  Private
 */
const getTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.getTicket(req.params.id, req.user._id, req.user.role);
  return successResponse(res, 'Ticket details retrieved successfully', { ticket });
});

/**
 * @desc    Get ticket QR payload and simulated image URL (Owner passenger / Admin)
 * @route   GET /api/v1/tickets/:id/qr
 * @access  Private
 */
const getTicketQr = asyncHandler(async (req, res) => {
  const ticket = await ticketService.getTicket(req.params.id, req.user._id, req.user.role);
  const qrImage = ticketService.generateQrCodeImage(ticket.qrPayload);
  
  return successResponse(res, 'Ticket QR payload retrieved successfully', {
    ticketCode: ticket.ticketCode,
    qrPayload: ticket.qrPayload,
    qrHash: ticket.qrHash,
    qrImage
  });
});

/**
 * @desc    Validate a ticket (Admin/Conductor)
 * @route   PATCH /api/v1/admin/tickets/:id/validate
 * @access  Private/Admin
 */
const validateTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.validateTicket(req.params.id, req.user._id, req.body);
  return successResponse(res, 'Ticket validated and marked as used successfully', { ticket });
});

/**
 * @desc    Cancel a ticket (Admin only)
 * @route   PATCH /api/v1/admin/tickets/:id/cancel
 * @access  Private/Admin
 */
const cancelTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.cancelTicket(req.params.id, req.user._id);
  return successResponse(res, 'Ticket cancelled successfully', { ticket });
});

module.exports = {
  getTickets,
  getMyTickets,
  getTicket,
  getTicketQr,
  validateTicket,
  cancelTicket
};
