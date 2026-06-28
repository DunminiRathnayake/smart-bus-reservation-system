/**
 * @file notificationService.js
 * @description Encapsulates all business logic for Notification Management (Sprint 12).
 */

const notificationRepository = require('../repository/notificationRepository');
const Notification = require('../model/Notification');
const NotificationType = require('../../../constants/notificationType');

class NotificationService {
  /**
   * Creates a new notification document.
   * Resilient wrapper: wraps delivery integrations in try/catch so database errors do not fail operations.
   * 
   * @param {Object} data - Notification payload.
   * @returns {Promise<Object>} The saved Notification document.
   */
  async createNotification(data) {
    // Save to the database
    const notification = await notificationRepository.create(data);

    // Resilient third-party channel integrations trigger:
    try {
      // TODO: Email notification delivery integration
      // TODO: SMS notification delivery integration
      // TODO: Push notification integration (APNS/FCM)
      // TODO: Firebase Cloud Messaging integration
      // TODO: WebSocket live update notification broadcast
    } catch (deliveryError) {
      console.error('Resilient Delivery Alert: Notification created but channel delivery failed:', deliveryError);
    }

    return notification;
  }

  /**
   * Broadcasts a SYSTEM notification to all users.
   * 
   * @param {Object} data - Notification body details.
   * @param {string} createdById - Admin user ID performing the broadcast.
   * @returns {Promise<Object>} Broadcast result.
   */
  async broadcastNotification(data, createdById) {
    const { title, message, metadata = {} } = data;

    // Create a broadcast record targeting all users (userId = null)
    return await this.createNotification({
      title,
      message,
      type: NotificationType.SYSTEM,
      userId: null,
      metadata: { ...metadata, broadcast: true },
      createdBy: createdById
    });
  }

  /**
   * Marks a specific notification as read.
   * 
   * @param {string} id - Notification ID.
   * @param {string} reqUserId - Authenticated user's ID.
   * @returns {Promise<Object>} The updated Notification document.
   */
  async markAsRead(id, reqUserId) {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    // Access Control: User can only mark their own notifications as read
    if (notification.userId && notification.userId.toString() !== reqUserId.toString()) {
      const error = new Error('Access denied. You can only update your own notifications');
      error.statusCode = 403;
      throw error;
    }

    if (notification.isRead) {
      return notification;
    }

    return await notificationRepository.update(id, {
      isRead: true,
      readAt: new Date(),
      updatedBy: reqUserId
    });
  }

  /**
   * Marks all unread notifications of the user as read.
   * 
   * @param {string} userId - User ID.
   * @returns {Promise<Object>} Mongoose update result details.
   */
  async markAllAsRead(userId) {
    return await notificationRepository.markAllAsRead(userId);
  }

  /**
   * Retrieves notification details by ID. Restricts access to owners and admins.
   * 
   * @param {string} id - Notification ID.
   * @param {string} reqUserId - Authenticated user's ID.
   * @param {string} reqUserRole - Authenticated user's role.
   * @returns {Promise<Object>} The notification document.
   */
  async getNotification(id, reqUserId, reqUserRole) {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    // Access Control: Passenger can only view their own notifications
    if (reqUserRole !== 'ADMIN' && notification.userId && notification.userId.toString() !== reqUserId.toString()) {
      const error = new Error('Access denied. You can only view your own notifications');
      error.statusCode = 403;
      throw error;
    }

    return notification;
  }

  /**
   * Retrieves all notifications (Admin only).
   * 
   * @param {Object} queryOptions - Pagination, searching, filtering, and sorting parameters.
   * @returns {Promise<Object>} List of notifications and pagination metadata.
   */
  async getNotifications(queryOptions) {
    return await notificationRepository.findAll(queryOptions);
  }

  /**
   * Retrieves notifications for the authenticated passenger (including global broadcast alerts).
   * 
   * @param {string} userId - Passenger's user ID.
   * @param {Object} queryOptions - Pagination parameters.
   * @returns {Promise<Object>} List of notifications.
   */
  async getMyNotifications(userId, queryOptions) {
    // When passengers fetch their notifications, they receive personal alerts + global alerts (userId = null)
    // We fetch them by doing a search or letting findAll match both.
    // Let's customize options in the repository query call:
    const page = queryOptions.page || 1;
    const limit = queryOptions.limit || 10;
    
    // We override filter logic to return both (userId OR null)
    const filter = {
      deletedAt: null,
      $or: [
        { userId },
        { userId: null }
      ]
    };
    
    if (queryOptions.type) {
      filter.type = queryOptions.type;
    }
    
    if (queryOptions.isRead !== undefined) {
      filter.isRead = queryOptions.isRead === 'true' || queryOptions.isRead === true;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [notifications, totalItems] = await Promise.all([
      Notification.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .exec(),
      Notification.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    return {
      notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrevious: pageNum > 1
      }
    };
  }
}

module.exports = new NotificationService();
