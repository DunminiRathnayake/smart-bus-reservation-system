/**
 * @file routes.js
 * @description Routes for Payment module protecting endpoints with auth, authorization, validation, and mapping to controllers.
 */

const express = require('express');
const router = express.Router();

const paymentController = require('../controller/paymentController');
const { authenticate, authorize } = require('../../../middleware/auth');
const { createPaymentRules } = require('../validation/paymentValidation');
const validate = require('../../../middleware/validate');

// Protect all payment routes globally with JWT authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/payments
 * @desc    Create a payment and simulate success processing (Passenger/Admin)
 * @access  Private
 */
router.post('/', createPaymentRules, validate, paymentController.createPayment);

/**
 * @route   GET /api/v1/payments/my
 * @desc    Get my payments (Authenticated passenger)
 * @access  Private
 * @note    Declared before /:id to prevent matching 'my' as parameter :id
 */
router.get('/my', paymentController.getMyPayments);

/**
 * @route   GET /api/v1/payments/:id
 * @desc    Retrieve payment details by ID (Owner passenger / Admin)
 * @access  Private
 */
router.get('/:id', paymentController.getPayment);

/**
 * @route   GET /api/v1/admin/payments
 * @desc    Get all payments (Admin only)
 * @access  Private/Admin
 */
router.get('/', (req, res, next) => {
  // If the request baseUrl matches the admin mount point, handle as Admin getPayments
  if (req.baseUrl.includes('/admin')) {
    return authorize('ADMIN')(req, res, () => {
      paymentController.getPayments(req, res, next);
    });
  }
  // If a passenger hits GET /api/v1/payments directly, return 404
  return res.status(404).json({ success: false, message: 'Endpoint not found' });
});

/**
 * @route   PATCH /api/v1/admin/payments/:id/refund
 * @desc    Refund a successful payment (Admin only)
 * @access  Private/Admin
 */
router.patch('/:id/refund', authorize('ADMIN'), paymentController.refundPayment);

module.exports = router;
