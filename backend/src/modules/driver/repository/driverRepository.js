/**
 * @file driverRepository.js
 * @description Encapsulates all database operations for the Driver model, supporting pagination, searching, sorting, and filtering.
 */

const Driver = require('../model/Driver');

class DriverRepository {
  /**
   * Creates and saves a new Driver document.
   * 
   * @param {Object} driverData - The details of the driver to create.
   * @returns {Promise<Object>} The saved driver document.
   */
  async create(driverData) {
    try {
      const driver = new Driver(driverData);
      return await driver.save();
    } catch (error) {
      throw new Error(`Database error in create driver: ${error.message}`);
    }
  }

  /**
   * Finds a non-deleted driver by their ID.
   * 
   * @param {string} id - The MongoDB ID of the driver.
   * @returns {Promise<Object|null>} The driver document, or null if not found.
   */
  async findById(id) {
    try {
      return await Driver.findOne({ _id: id, deletedAt: null }).exec();
    } catch (error) {
      throw new Error(`Database error in findById driver: ${error.message}`);
    }
  }

  /**
   * Finds all non-deleted drivers matching query criteria, supporting pagination, searching, filtering, and sorting.
   * 
   * @param {Object} options - Query options.
   * @param {number} [options.page=1] - Page number.
   * @param {number} [options.limit=10] - Number of items per page.
   * @param {string} [options.search=''] - Search term matching employeeId, fullName, email, phoneNumber, nic, or licenseNumber.
   * @param {string} [options.status=''] - Filter by status (ACTIVE, INACTIVE, ON_LEAVE, SUSPENDED).
   * @param {string} [options.gender=''] - Filter by gender (MALE, FEMALE, OTHER).
   * @param {string} [options.sortBy='-createdAt'] - Sorting parameter.
   * @returns {Promise<Object>} Object containing drivers list and pagination metadata.
   */
  async findAll({ page = 1, limit = 10, search = '', status = '', gender = '', sortBy = '-createdAt' }) {
    try {
      const filter = { deletedAt: null };

      // 1. Text Search (matches employeeId, fullName, email, phoneNumber, nic, or licenseNumber)
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter.$or = [
          { employeeId: searchRegex },
          { fullName: searchRegex },
          { email: searchRegex },
          { phoneNumber: searchRegex },
          { nic: searchRegex },
          { licenseNumber: searchRegex }
        ];
      }

      // 2. Filters
      if (status) {
        filter.status = status;
      }
      if (gender) {
        filter.gender = gender;
      }

      // 3. Sorting
      let sortOption = '-createdAt';
      const allowedSortFields = [
        'createdAt', '-createdAt',
        'fullName', '-fullName',
        'employeeId', '-employeeId',
        'joiningDate', '-joiningDate'
      ];
      if (sortBy && allowedSortFields.includes(sortBy)) {
        sortOption = sortBy;
      }

      // 4. Pagination
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const skip = (pageNum - 1) * limitNum;

      // 5. Query execution using Promise.all
      const [drivers, totalItems] = await Promise.all([
        Driver.find(filter)
          .sort(sortOption)
          .skip(skip)
          .limit(limitNum)
          .exec(),
        Driver.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalItems / limitNum);

      return {
        drivers,
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
      throw new Error(`Database error in findAll drivers: ${error.message}`);
    }
  }

  /**
   * Updates an existing driver.
   * 
   * @param {string} id - The MongoDB ID of the driver to update.
   * @param {Object} data - The updated data.
   * @returns {Promise<Object|null>} The updated driver document, or null if not found.
   */
  async update(id, data) {
    try {
      return await Driver.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
      }).exec();
    } catch (error) {
      throw new Error(`Database error in update driver: ${error.message}`);
    }
  }

  /**
   * Checks if an active driver exists with any of the specified unique fields (employeeId, nic, or licenseNumber).
   * 
   * @param {string} employeeId - The employee ID.
   * @param {string} nic - The national identity card number.
   * @param {string} licenseNumber - The driver license number.
   * @returns {Promise<boolean>} True if any match exists, false otherwise.
   */
  async exists(employeeId, nic, licenseNumber) {
    try {
      const query = {
        deletedAt: null,
        $or: [
          { employeeId },
          { nic },
          { licenseNumber }
        ]
      };
      const result = await Driver.exists(query);
      return !!result;
    } catch (error) {
      throw new Error(`Database error in exists driver: ${error.message}`);
    }
  }

  /**
   * Checks if another active driver exists with a duplicate field value, excluding a specific driver ID.
   * Useful for validating update uniqueness.
   * 
   * @param {string} field - The field to check (e.g. 'employeeId', 'nic', or 'licenseNumber').
   * @param {string} value - The candidate value.
   * @param {string} id - The ID of the driver to exclude from verification.
   * @returns {Promise<boolean>} True if duplicate exists, false otherwise.
   */
  async existsExcludeId(field, value, id) {
    try {
      const query = {
        _id: { $ne: id },
        deletedAt: null,
        [field]: value
      };
      const result = await Driver.exists(query);
      return !!result;
    } catch (error) {
      throw new Error(`Database error in existsExcludeId driver: ${error.message}`);
    }
  }
}

module.exports = new DriverRepository();
