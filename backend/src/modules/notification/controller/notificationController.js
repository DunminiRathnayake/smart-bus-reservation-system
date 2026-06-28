/**
 * @file notificationController.js
 * @description Notification Controller mapping HTTP requests to NotificationService actions using standard response helpers.
 */

const notificationService = require('../service/notificationService');
const asyncHandler = require('../../../middleware/asyncHandler');
const { successResponse, paginatedResponse } = require('../../../utils/response');

/**
 * @desc    Get my notifications (Authenticated passenger)
 * @route   GET /api/v1/notifications
 * @access  Private
 */
const getMyNotifications = asyncHandler(async (req, res) => {
  const { page, limit, type, isRead } = req.query;
  const result = await notificationService.getMyNotifications(req.user._id, { page, limit, type, isRead });
  
  return paginatedResponse(res, 'Your notifications retrieved successfully', 'notifications', result.notifications, result.pagination);
});

/**
 * @desc    Get all notifications (Admin only)
 * @route   GET /api/v1/admin/notifications
 * @access  Private/Admin
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, search, type, userId, isRead, sortBy } = req.query;
  const result = await notificationService.getNotifications({ page, limit, search, type, userId, isRead, sortBy });
  
  return paginatedResponse(res, 'Notifications retrieved successfully', 'notifications', result.notifications, result.pagination);
});

/**
 * @desc    Mark notification as read (Owner passenger)
 * @route   PATCH /api/v1/notifications/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  return successResponse(res, 'Notification marked as read successfully', { notification });
});

/**
 * @desc    Mark all notifications as read (Authenticated passenger)
 * @route   PATCH /api/v1/notifications/read-all
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  return successResponse(res, 'All notifications marked as read successfully', null);
});

/**
 * @desc    Broadcast a system notification to all passengers (Admin only)
 * @route   POST /api/v1/admin/notifications/broadcast
 * @access  Private/Admin
 */
const broadcastNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.broadcastNotification(req.body, req.user._id);
  return successResponse(res, 'System broadcast notification dispatched successfully', { notification }, 201);
});

module.exports = {
  getMyNotifications,
  getNotifications,
  markAsRead,
  markAllAsRead,
  broadcastNotification
};
