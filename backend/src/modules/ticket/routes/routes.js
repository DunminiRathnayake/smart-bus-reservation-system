/**
 * @file routes.js
 * @description Routes for Ticket module protecting endpoints with auth, authorization, validation, and mapping to controllers.
 */

const express = require('express');
const router = express.Router();

const ticketController = require('../controller/ticketController');
const { authenticate, authorize } = require('../../../middleware/auth');
const { idParamRules, validateTicketRules, scanTicketRules } = require('../validation/ticketValidation');
const validate = require('../../../middleware/validate');

// Protect all ticket routes globally with JWT authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/tickets  OR  GET /api/v1/admin/tickets
 * @desc    Get my tickets (Passenger) OR Get all tickets (Admin only)
 * @access  Private
 */
router.get('/', (req, res, next) => {
  // If the request baseUrl matches the admin mount point, handle as Admin getTickets
  if (req.baseUrl.includes('/admin')) {
    return authorize('ADMIN')(req, res, () => {
      ticketController.getTickets(req, res, next);
    });
  }
  // Otherwise, handle as Passenger getMyTickets
  return ticketController.getMyTickets(req, res, next);
});

/**
 * @route   GET /api/v1/tickets/:id
 * @desc    Retrieve ticket details by ID (Owner passenger / Admin)
 * @access  Private
 */
router.get('/:id', idParamRules, validate, ticketController.getTicket);

/**
 * @route   GET /api/v1/tickets/:id/qr
 * @desc    Retrieve ticket QR payload and image URL (Owner passenger / Admin)
 * @access  Private
 */
router.get('/:id/qr', idParamRules, validate, ticketController.getTicketQr);

/**
 * @route   PATCH /api/v1/admin/tickets/:id/validate
 * @desc    Validate ticket and mark as USED (Admin only)
 * @access  Private/Admin
 */
router.patch('/:id/validate', authorize('ADMIN'), validateTicketRules, validate, ticketController.validateTicket);

/**
 * @route   PATCH /api/v1/admin/tickets/:id/cancel
 * @desc    Cancel an active ticket (Admin only)
 * @access  Private/Admin
 */
router.patch('/:id/cancel', authorize('ADMIN'), idParamRules, validate, ticketController.cancelTicket);

/**
 * @route   POST /api/v1/tickets/scan
 * @desc    Placeholder for future QR scans validations
 * @access  Private
 */
router.post('/scan', scanTicketRules, validate, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'QR ticket scan validation rules succeeded. Future scanner hook ready.',
    data: req.body
  });
});

module.exports = router;
