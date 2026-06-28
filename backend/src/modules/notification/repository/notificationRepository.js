/**
 * @file notificationRepository.js
 * @description Encapsulates all database operations for the Notification model, supporting pagination, searching, sorting, and filtering.
 */

const Notification = require('../model/Notification');

class NotificationRepository {
  /**
   * Creates and saves a new Notification document.
   * 
   * @param {Object} data - The details of the notification to create.
   * @returns {Promise<Object>} The saved notification document.
   */
  async create(data) {
    try {
      const notification = new Notification(data);
      return await notification.save();
    } catch (error) {
      throw new Error(`Database error in create notification: ${error.message}`);
    }
  }

  /**
   * Finds a non-deleted notification by its ID.
   * 
   * @param {string} id - The MongoDB ID of the notification.
   * @returns {Promise<Object|null>} The notification document.
   */
  async findById(id) {
    try {
      return await Notification.findOne({ _id: id, deletedAt: null }).exec();
    } catch (error) {
      throw new Error(`Database error in findById notification: ${error.message}`);
    }
  }

  /**
   * Finds notifications associated with a specific user.
   * 
   * @param {string} userId - The user ID.
   * @returns {Promise<Array<Object>>} Array of notification documents.
   */
  async findByUser(userId) {
    try {
      return await Notification.find({ userId, deletedAt: null }).sort('-createdAt').exec();
    } catch (error) {
      throw new Error(`Database error in findByUser notification: ${error.message}`);
    }
  }

  /**
   * Finds all non-deleted notifications matching query criteria, supporting pagination, searching, filtering, and sorting.
   * 
   * @param {Object} options - Query options.
   * @param {number} [options.page=1] - Page number.
   * @param {number} [options.limit=10] - Number of items per page.
   * @param {string} [options.search=''] - Search term matching title or message.
   * @param {string} [options.type=''] - Filter by notification type.
   * @param {string} [options.userId=''] - Filter by userId.
   * @param {boolean} [options.isRead] - Filter by read status.
   * @param {string} [options.sortBy='-createdAt'] - Sorting parameter.
   * @returns {Promise<Object>} Object containing notifications list and pagination metadata.
   */
  async findAll({ page = 1, limit = 10, search = '', type = '', userId = '', isRead = undefined, sortBy = '-createdAt' }) {
    try {
      const filter = { deletedAt: null };

      // 1. Text Search (matches title or message)
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter.$or = [
          { title: searchRegex },
          { message: searchRegex }
        ];
      }

      // 2. Filters
      if (type) {
        filter.type = type;
      }
      if (userId) {
        filter.userId = userId;
      }
      if (isRead !== undefined) {
        filter.isRead = isRead === 'true' || isRead === true;
      }

      // 3. Sorting
      let sortOption = '-createdAt';
      const allowedSortFields = ['createdAt', '-createdAt'];
      if (sortBy && allowedSortFields.includes(sortBy)) {
        sortOption = sortBy;
      }

      // 4. Pagination
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const skip = (pageNum - 1) * limitNum;

      // 5. Query execution using Promise.all
      const [notifications, totalItems] = await Promise.all([
        Notification.find(filter)
          .sort(sortOption)
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
    } catch (error) {
      throw new Error(`Database error in findAll notifications: ${error.message}`);
    }
  }

  /**
   * Updates notification details.
   * 
   * @param {string} id - The MongoDB ID of the notification to update.
   * @param {Object} data - The updated data.
   * @returns {Promise<Object|null>} The updated notification document.
   */
  async update(id, data) {
    try {
      return await Notification.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
      }).exec();
    } catch (error) {
      throw new Error(`Database error in update notification: ${error.message}`);
    }
  }

  /**
   * Marks all unread notifications of a specific user as read.
   * 
   * @param {string} userId - User ID.
   * @returns {Promise<Object>} Mongoose update result.
   */
  async markAllAsRead(userId) {
    try {
      return await Notification.updateMany(
        { userId, isRead: false, deletedAt: null },
        { isRead: true, readAt: new Date() }
      ).exec();
    } catch (error) {
      throw new Error(`Database error in markAllAsRead: ${error.message}`);
    }
  }
}

module.exports = new NotificationRepository();
