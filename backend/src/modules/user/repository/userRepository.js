/**
 * @file userRepository.js
 * @description Encapsulates all database operations for the User model, supporting soft deletes, pagination, searching, sorting, and filtering.
 */

const User = require('../model/User');

class UserRepository {
  /**
   * Finds a non-deleted user by their email address.
   * 
   * @param {string} email - The email to search for.
   * @param {boolean} [includePassword=false] - Whether to explicitly include the password field.
   * @returns {Promise<Object|null>} The user document, or null if not found.
   */
  async findByEmail(email, includePassword = false) {
    try {
      const query = User.findOne({ email, deletedAt: null });
      if (includePassword) {
        query.select('+password');
      }
      return await query.exec();
    } catch (error) {
      throw new Error(`Database error in findByEmail: ${error.message}`);
    }
  }

  /**
   * Finds a non-deleted user by their ID.
   * 
   * @param {string} id - The MongoDB ID.
   * @returns {Promise<Object|null>} The user document, or null if not found.
   */
  async findById(id) {
    try {
      return await User.findOne({ _id: id, deletedAt: null }).exec();
    } catch (error) {
      throw new Error(`Database error in findById: ${error.message}`);
    }
  }

  /**
   * Finds all non-deleted users matching query criteria, supporting pagination, searching, filtering, and sorting.
   * 
   * @param {Object} options - Query options.
   * @param {number} [options.page=1] - Page number.
   * @param {number} [options.limit=10] - Number of items per page.
   * @param {string} [options.search=''] - Search term matching fullName, email, or phoneNumber.
   * @param {string} [options.role=''] - Filter by user role.
   * @param {string} [options.status=''] - Filter by status (ACTIVE, INACTIVE, SUSPENDED).
   * @param {string} [options.sortBy='-createdAt'] - Sorting parameter.
   * @returns {Promise<Object>} Object containing users list and pagination information.
   */
  async findAll({ page = 1, limit = 10, search = '', role = '', status = '', sortBy = '-createdAt' }) {
    try {
      const filter = { deletedAt: null };

      // 1. Text Search
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter.$or = [
          { fullName: searchRegex },
          { email: searchRegex },
          { phoneNumber: searchRegex }
        ];
      }

      // 2. Filters
      if (role) {
        filter.role = role;
      }
      if (status) {
        filter.status = status;
      }

      // 3. Sorting
      let sortOption = '-createdAt';
      const allowedSortFields = ['createdAt', '-createdAt', 'fullName', '-fullName', 'email', '-email'];
      if (sortBy && allowedSortFields.includes(sortBy)) {
        sortOption = sortBy;
      }

      // 4. Pagination
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const skip = (pageNum - 1) * limitNum;

      // 5. Query Execution with Promise.all
      const [users, totalItems] = await Promise.all([
        User.find(filter)
          .sort(sortOption)
          .skip(skip)
          .limit(limitNum)
          .exec(),
        User.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalItems / limitNum);

      return {
        users,
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
      throw new Error(`Database error in findAll: ${error.message}`);
    }
  }

  /**
   * Creates and saves a new user.
   * 
   * @param {Object} userData - The details of the user to create.
   * @returns {Promise<Object>} The saved user document.
   */
  async create(userData) {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      throw new Error(`Database error in create: ${error.message}`);
    }
  }

  /**
   * Updates an existing user.
   * 
   * @param {string} id - The MongoDB ID of the user to update.
   * @param {Object} data - The updated data.
   * @returns {Promise<Object|null>} The updated user document, or null if not found.
   */
  async update(id, data) {
    try {
      return await User.findByIdAndUpdate(id, data, {
        new: true, // Returns the modified document rather than the original
        runValidators: true // Runs validation checks on the update data against the schema rules
      }).exec();
    } catch (error) {
      throw new Error(`Database error in update: ${error.message}`);
    }
  }

  /**
   * Checks if a non-deleted user with the specified email address exists.
   * 
   * @param {string} email - The email to check.
   * @returns {Promise<boolean>} True if user exists, false otherwise.
   */
  async exists(email) {
    try {
      const result = await User.exists({ email, deletedAt: null });
      return !!result;
    } catch (error) {
      throw new Error(`Database error in exists: ${error.message}`);
    }
  }
}

module.exports = new UserRepository();
