/**
 * @file reportController.js
 * @description Report Controller mapping HTTP requests to ReportService actions using standard response helpers.
 */

const reportService = require('../service/reportService');
const asyncHandler = require('../../../middleware/asyncHandler');
const { successResponse } = require('../../../utils/response');

/**
 * @desc    Get dashboard summary statistics (Admin only)
 * @route   GET /api/v1/admin/reports/dashboard
 * @access  Private/Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const data = await reportService.getDashboardStats();
  return successResponse(res, 'Dashboard statistics retrieved successfully', data);
});

/**
 * @desc    Get revenue aggregate reports (Admin only)
 * @route   GET /api/v1/admin/reports/revenue
 * @access  Private/Admin
 */
const getRevenueReport = asyncHandler(async (req, res) => {
  const { range, startDate, endDate } = req.query;
  const data = await reportService.getRevenueReport(range, startDate, endDate);
  return successResponse(res, 'Revenue report retrieved successfully', data);
});

/**
 * @desc    Get bookings aggregate reports (Admin only)
 * @route   GET /api/v1/admin/reports/bookings
 * @access  Private/Admin
 */
const getBookingReport = asyncHandler(async (req, res) => {
  const { range, startDate, endDate } = req.query;
  const data = await reportService.getBookingReport(range, startDate, endDate);
  return successResponse(res, 'Booking report retrieved successfully', data);
});

/**
 * @desc    Get routes performance reports (Admin only)
 * @route   GET /api/v1/admin/reports/routes
 * @access  Private/Admin
 */
const getRouteReport = asyncHandler(async (req, res) => {
  const data = await reportService.getRouteReport();
  return successResponse(res, 'Route report retrieved successfully', data);
});

/**
 * @desc    Get buses performance reports (Admin only)
 * @route   GET /api/v1/admin/reports/buses
 * @access  Private/Admin
 */
const getBusReport = asyncHandler(async (req, res) => {
  const data = await reportService.getBusReport();
  return successResponse(res, 'Bus report retrieved successfully', data);
});

/**
 * @desc    Get drivers assignments reports (Admin only)
 * @route   GET /api/v1/admin/reports/drivers
 * @access  Private/Admin
 */
const getDriverReport = asyncHandler(async (req, res) => {
  const data = await reportService.getDriverReport();
  return successResponse(res, 'Driver report retrieved successfully', data);
});

/**
 * @desc    Get payment transactions reports (Admin only)
 * @route   GET /api/v1/admin/reports/payments
 * @access  Private/Admin
 */
const getPaymentReport = asyncHandler(async (req, res) => {
  const { range, startDate, endDate } = req.query;
  const data = await reportService.getPaymentReport(range, startDate, endDate);
  return successResponse(res, 'Payment report retrieved successfully', data);
});

/**
 * @desc    Get seat status occupancy reports (Admin only)
 * @route   GET /api/v1/admin/reports/seats
 * @access  Private/Admin
 */
const getSeatReport = asyncHandler(async (req, res) => {
  const data = await reportService.getSeatReport();
  return successResponse(res, 'Seat report retrieved successfully', data);
});

/**
 * @desc    Get notifications read status reports (Admin only)
 * @route   GET /api/v1/admin/reports/notifications
 * @access  Private/Admin
 */
const getNotificationReport = asyncHandler(async (req, res) => {
  const data = await reportService.getNotificationReport();
  return successResponse(res, 'Notification report retrieved successfully', data);
});

module.exports = {
  getDashboardStats,
  getRevenueReport,
  getBookingReport,
  getRouteReport,
  getBusReport,
  getDriverReport,
  getPaymentReport,
  getSeatReport,
  getNotificationReport
};
