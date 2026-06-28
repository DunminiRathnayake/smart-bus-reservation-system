/**
 * @file routes.js
 * @description Routes for Notification module protecting endpoints with auth, authorization, validation, and mapping to controllers.
 */

const express = require('express');
const router = express.Router();

const notificationController = require('../controller/notificationController');
const { authenticate, authorize } = require('../../../middleware/auth');
const { idParamRules, broadcastRules } = require('../validation/notificationValidation');
const validate = require('../../../middleware/validate');

// Protect all notification routes globally with JWT authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/notifications  OR  GET /api/v1/admin/notifications
 * @desc    Get my notifications (Passenger) OR Get all notifications (Admin only)
 * @access  Private
 */
router.get('/', (req, res, next) => {
  // If the request baseUrl matches the admin mount point, handle as Admin getNotifications
  if (req.baseUrl.includes('/admin')) {
    return authorize('ADMIN')(req, res, () => {
      notificationController.getNotifications(req, res, next);
    });
  }
  // Otherwise, handle as Passenger getMyNotifications
  return notificationController.getMyNotifications(req, res, next);
});

/**
 * @route   PATCH /api/v1/notifications/read-all
 * @desc    Mark all notifications of the authenticated user as read
 * @access  Private
 * @note    Declared before /:id/read to prevent routing conflicts
 */
router.patch('/read-all', notificationController.markAllAsRead);

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    Mark a specific notification as read (Owner passenger only)
 * @access  Private
 */
router.patch('/:id/read', idParamRules, validate, notificationController.markAsRead);

/**
 * @route   POST /api/v1/admin/notifications/broadcast
 * @desc    Broadcast a system notification to all passengers (Admin only)
 * @access  Private/Admin
 */
router.post('/broadcast', authorize('ADMIN'), broadcastRules, validate, notificationController.broadcastNotification);

module.exports = router;
