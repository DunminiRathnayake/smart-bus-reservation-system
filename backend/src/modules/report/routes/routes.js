/**
 * @file routes.js
 * @description Routes for Report module protecting endpoints with auth, authorization, and mapping to controllers.
 */

const express = require('express');
const router = express.Router();

const reportController = require('../controller/reportController');
const { authenticate, authorize } = require('../../../middleware/auth');

// Protect all reporting routes globally with JWT authentication and ADMIN authorization
router.use(authenticate);
router.use(authorize('ADMIN'));

/**
 * @route   GET /api/v1/admin/reports/dashboard
 * @desc    Get dashboard summary statistics (Admin only)
 * @access  Private/Admin
 */
router.get('/dashboard', reportController.getDashboardStats);

/**
 * @route   GET /api/v1/admin/reports/revenue
 * @desc    Get revenue aggregate reports (Admin only)
 * @access  Private/Admin
 */
router.get('/revenue', reportController.getRevenueReport);

/**
 * @route   GET /api/v1/admin/reports/bookings
 * @desc    Get bookings aggregate reports (Admin only)
 * @access  Private/Admin
 */
router.get('/bookings', reportController.getBookingReport);

/**
 * @route   GET /api/v1/admin/reports/routes
 * @desc    Get routes performance reports (Admin only)
 * @access  Private/Admin
 */
router.get('/routes', reportController.getRouteReport);

/**
 * @route   GET /api/v1/admin/reports/buses
 * @desc    Get buses performance reports (Admin only)
 * @access  Private/Admin
 */
router.get('/buses', reportController.getBusReport);

/**
 * @route   GET /api/v1/admin/reports/drivers
 * @desc    Get drivers assignments reports (Admin only)
 * @access  Private/Admin
 */
router.get('/drivers', reportController.getDriverReport);

/**
 * @route   GET /api/v1/admin/reports/payments
 * @desc    Get payment transactions reports (Admin only)
 * @access  Private/Admin
 */
router.get('/payments', reportController.getPaymentReport);

/**
 * @route   GET /api/v1/admin/reports/seats
 * @desc    Get seat status occupancy reports (Admin only)
 * @access  Private/Admin
 */
router.get('/seats', reportController.getSeatReport);

/**
 * @route   GET /api/v1/admin/reports/notifications
 * @desc    Get notifications read status reports (Admin only)
 * @access  Private/Admin
 */
router.get('/notifications', reportController.getNotificationReport);

module.exports = router;
