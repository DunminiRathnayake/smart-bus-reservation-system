/**
 * @file busRepository.js
 * @description Encapsulates all database operations for the Bus model, supporting pagination, searching, sorting, and filtering.
 */

const Bus = require('../model/Bus');

class BusRepository {
  /**
   * Creates and saves a new Bus document.
   * 
   * @param {Object} busData - The details of the bus to create.
   * @returns {Promise<Object>} The saved bus document.
   */
  async create(busData) {
    try {
      const bus = new Bus(busData);
      return await bus.save();
    } catch (error) {
      throw new Error(`Database error in create bus: ${error.message}`);
    }
  }

  /**
   * Finds a non-deleted bus by its ID.
   * 
   * @param {string} id - The MongoDB ID of the bus.
   * @returns {Promise<Object|null>} The bus document, or null if not found.
   */
  async findById(id) {
    try {
      return await Bus.findOne({ _id: id, deletedAt: null }).exec();
    } catch (error) {
      throw new Error(`Database error in findById bus: ${error.message}`);
    }
  }

  /**
   * Finds all non-deleted buses matching query criteria, supporting pagination, searching, filtering, and sorting.
   * 
   * @param {Object} options - Query options.
   * @param {number} [options.page=1] - Page number.
   * @param {number} [options.limit=10] - Number of items per page.
   * @param {string} [options.search=''] - Search term matching busNumber, registrationNumber, or busName.
   * @param {string} [options.type=''] - Filter by bus type.
   * @param {string} [options.status=''] - Filter by status (ACTIVE, INACTIVE, MAINTENANCE).
   * @param {string} [options.sortBy='-createdAt'] - Sorting parameter.
   * @returns {Promise<Object>} Object containing buses list and pagination metadata.
   */
  async findAll({ page = 1, limit = 10, search = '', type = '', status = '', sortBy = '-createdAt' }) {
    try {
      const filter = { deletedAt: null };

      // 1. Text Search (matches busNumber, registrationNumber, or busName)
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter.$or = [
          { busNumber: searchRegex },
          { registrationNumber: searchRegex },
          { busName: searchRegex }
        ];
      }

      // 2. Filters
      if (type) {
        filter.type = type;
      }
      if (status) {
        filter.status = status;
      }

      // 3. Sorting
      let sortOption = '-createdAt';
      const allowedSortFields = ['createdAt', '-createdAt', 'busNumber', '-busNumber', 'capacity', '-capacity'];
      if (sortBy && allowedSortFields.includes(sortBy)) {
        sortOption = sortBy;
      }

      // 4. Pagination
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const skip = (pageNum - 1) * limitNum;

      // 5. Query execution using Promise.all
      const [buses, totalItems] = await Promise.all([
        Bus.find(filter)
          .sort(sortOption)
          .skip(skip)
          .limit(limitNum)
          .exec(),
        Bus.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalItems / limitNum);

      return {
        buses,
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
      throw new Error(`Database error in findAll buses: ${error.message}`);
    }
  }

  /**
   * Updates an existing bus.
   * 
   * @param {string} id - The MongoDB ID of the bus to update.
   * @param {Object} data - The updated data.
   * @returns {Promise<Object|null>} The updated bus document, or null if not found.
   */
  async update(id, data) {
    try {
      return await Bus.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
      }).exec();
    } catch (error) {
      throw new Error(`Database error in update bus: ${error.message}`);
    }
  }

  /**
   * Checks if an active bus exists with either the specified busNumber or registrationNumber.
   * 
   * @param {string} busNumber - The bus number.
   * @param {string} registrationNumber - The registration number.
   * @returns {Promise<boolean>} True if any match exists, false otherwise.
   */
  async exists(busNumber, registrationNumber) {
    try {
      const query = {
        deletedAt: null,
        $or: [
          { busNumber },
          { registrationNumber }
        ]
      };
      const result = await Bus.exists(query);
      return !!result;
    } catch (error) {
      throw new Error(`Database error in exists bus: ${error.message}`);
    }
  }

  /**
   * Checks if another active bus exists with a duplicate field value, excluding a specific bus ID.
   * Useful for validating update uniqueness.
   * 
   * @param {string} field - The field to check (e.g. 'busNumber' or 'registrationNumber').
   * @param {string} value - The candidate value.
   * @param {string} id - The ID of the bus to exclude from verification.
   * @returns {Promise<boolean>} True if duplicate exists, false otherwise.
   */
  async existsExcludeId(field, value, id) {
    try {
      const query = {
        _id: { $ne: id },
        deletedAt: null,
        [field]: value
      };
      const result = await Bus.exists(query);
      return !!result;
    } catch (error) {
      throw new Error(`Database error in existsExcludeId bus: ${error.message}`);
    }
  }
}

module.exports = new BusRepository();
