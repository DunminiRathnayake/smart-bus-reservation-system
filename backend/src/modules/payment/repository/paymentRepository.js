/**
 * @file paymentRepository.js
 * @description Encapsulates all database operations for the Payment model, supporting pagination, searching, sorting, and filtering.
 */

const Payment = require('../model/Payment');

class PaymentRepository {
  /**
   * Creates and saves a new Payment document.
   * 
   * @param {Object} paymentData - The details of the payment to create.
   * @returns {Promise<Object>} The saved payment document.
   */
  async create(paymentData) {
    try {
      const payment = new Payment(paymentData);
      return await payment.save();
    } catch (error) {
      throw new Error(`Database error in create payment: ${error.message}`);
    }
  }

  /**
   * Finds a non-deleted payment by its ID.
   * 
   * @param {string} id - The MongoDB ID of the payment.
   * @returns {Promise<Object|null>} The payment document, or null if not found.
   */
  async findById(id) {
    try {
      return await Payment.findOne({ _id: id, deletedAt: null }).exec();
    } catch (error) {
      throw new Error(`Database error in findById payment: ${error.message}`);
    }
  }

  /**
   * Finds payments associated with a specific booking.
   * 
   * @param {string} bookingId - The booking ID.
   * @returns {Promise<Array<Object>>} Array of payment documents.
   */
  async findByBooking(bookingId) {
    try {
      return await Payment.find({ bookingId, deletedAt: null }).exec();
    } catch (error) {
      throw new Error(`Database error in findByBooking payment: ${error.message}`);
    }
  }

  /**
   * Finds payments associated with a specific user.
   * 
   * @param {string} userId - The user ID.
   * @returns {Promise<Array<Object>>} Array of payment documents.
   */
  async findByUser(userId) {
    try {
      return await Payment.find({ userId, deletedAt: null }).exec();
    } catch (error) {
      throw new Error(`Database error in findByUser payment: ${error.message}`);
    }
  }

  /**
   * Finds all non-deleted payments matching query criteria, supporting pagination, searching, filtering, and sorting.
   * 
   * @param {Object} options - Query options.
   * @param {number} [options.page=1] - Page number.
   * @param {number} [options.limit=10] - Number of items per page.
   * @param {string} [options.search=''] - Search term matching paymentCode or transactionReference.
   * @param {string} [options.paymentStatus=''] - Filter by payment status.
   * @param {string} [options.paymentMethod=''] - Filter by payment method.
   * @param {string} [options.bookingId=''] - Filter by bookingId.
   * @param {string} [options.userId=''] - Filter by userId.
   * @param {string} [options.sortBy='-createdAt'] - Sorting parameter.
   * @returns {Promise<Object>} Object containing payments list and pagination metadata.
   */
  async findAll({ page = 1, limit = 10, search = '', paymentStatus = '', paymentMethod = '', bookingId = '', userId = '', sortBy = '-createdAt' }) {
    try {
      const filter = { deletedAt: null };

      // 1. Text Search (matches paymentCode or transactionReference)
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter.$or = [
          { paymentCode: searchRegex },
          { transactionReference: searchRegex }
        ];
      }

      // 2. Filters
      if (paymentStatus) {
        filter.paymentStatus = paymentStatus;
      }
      if (paymentMethod) {
        filter.paymentMethod = paymentMethod;
      }
      if (bookingId) {
        filter.bookingId = bookingId;
      }
      if (userId) {
        filter.userId = userId;
      }

      // 3. Sorting
      let sortOption = '-createdAt';
      const allowedSortFields = [
        'createdAt', '-createdAt',
        'amount', '-amount',
        'paidAt', '-paidAt'
      ];
      if (sortBy && allowedSortFields.includes(sortBy)) {
        sortOption = sortBy;
      }

      // 4. Pagination
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const skip = (pageNum - 1) * limitNum;

      // 5. Query execution using Promise.all
      const [payments, totalItems] = await Promise.all([
        Payment.find(filter)
          .sort(sortOption)
          .skip(skip)
          .limit(limitNum)
          .exec(),
        Payment.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalItems / limitNum);

      return {
        payments,
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
      throw new Error(`Database error in findAll payments: ${error.message}`);
    }
  }

  /**
   * Updates payment details.
   * 
   * @param {string} id - The MongoDB ID of the payment to update.
   * @param {Object} data - The updated data.
   * @returns {Promise<Object|null>} The updated payment document, or null if not found.
   */
  async update(id, data) {
    try {
      return await Payment.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
      }).exec();
    } catch (error) {
      throw new Error(`Database error in update payment: ${error.message}`);
    }
  }
}

module.exports = new PaymentRepository();
