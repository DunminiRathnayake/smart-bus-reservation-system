/**
 * @file paymentController.js
 * @description Payment Controller mapping HTTP requests to PaymentService actions using standard response helpers.
 */

const paymentService = require('../service/paymentService');
const asyncHandler = require('../../../middleware/asyncHandler');
const { successResponse, paginatedResponse } = require('../../../utils/response');

/**
 * @desc    Create a payment and simulate success processing (Passenger/Admin)
 * @route   POST /api/v1/payments
 * @access  Private
 */
const createPayment = asyncHandler(async (req, res) => {
  // 1. Create the pending payment transaction first (enforcing validation parameters)
  const pendingPayment = await paymentService.createPayment(req.body, req.user._id, req.user.role);
  
  // 2. Immediately simulate successful payment authorization through simulated gateway
  const payment = await paymentService.simulatePayment(pendingPayment._id, true);
  
  return successResponse(res, 'Payment processed successfully and booking confirmed', { payment }, 201);
});

/**
 * @desc    Get payment details by ID (Owner passenger / Admin)
 * @route   GET /api/v1/payments/:id
 * @access  Private
 */
const getPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPayment(req.params.id, req.user._id, req.user.role);
  return successResponse(res, 'Payment details retrieved successfully', { payment });
});

/**
 * @desc    Get my payments (Authenticated passenger)
 * @route   GET /api/v1/payments/my
 * @access  Private
 */
const getMyPayments = asyncHandler(async (req, res) => {
  const { page, limit, paymentStatus, paymentMethod, sortBy } = req.query;
  const result = await paymentService.getMyPayments(req.user._id, { page, limit, paymentStatus, paymentMethod, sortBy });
  
  return paginatedResponse(res, 'Your payments retrieved successfully', 'payments', result.payments, result.pagination);
});

/**
 * @desc    Get all payments (Admin only)
 * @route   GET /api/v1/admin/payments
 * @access  Private/Admin
 */
const getPayments = asyncHandler(async (req, res) => {
  const { page, limit, search, paymentStatus, paymentMethod, bookingId, userId, sortBy } = req.query;
  const result = await paymentService.getPayments({ page, limit, search, paymentStatus, paymentMethod, bookingId, userId, sortBy });
  
  return paginatedResponse(res, 'Payments retrieved successfully', 'payments', result.payments, result.pagination);
});

/**
 * @desc    Refund a successful payment (Admin only)
 * @route   PATCH /api/v1/admin/payments/:id/refund
 * @access  Private/Admin
 */
const refundPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.refundPayment(req.params.id, req.user._id);
  return successResponse(res, 'Payment refunded successfully', { payment });
});

module.exports = {
  createPayment,
  getPayment,
  getMyPayments,
  getPayments,
  refundPayment
};
