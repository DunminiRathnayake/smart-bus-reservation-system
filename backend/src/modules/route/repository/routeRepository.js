/**
 * @file routeRepository.js
 * @description Encapsulates all database operations for the Route model, supporting pagination, searching, sorting, and filtering.
 */

const Route = require('../model/Route');

class RouteRepository {
  /**
   * Creates and saves a new Route document.
   * 
   * @param {Object} routeData - The details of the route to create.
   * @returns {Promise<Object>} The saved route document.
   */
  async create(routeData) {
    try {
      const route = new Route(routeData);
      return await route.save();
    } catch (error) {
      throw new Error(`Database error in create route: ${error.message}`);
    }
  }

  /**
   * Finds a non-deleted route by its ID.
   * 
   * @param {string} id - The MongoDB ID of the route.
   * @returns {Promise<Object|null>} The route document, or null if not found.
   */
  async findById(id) {
    try {
      return await Route.findOne({ _id: id, deletedAt: null }).exec();
    } catch (error) {
      throw new Error(`Database error in findById route: ${error.message}`);
    }
  }

  /**
   * Finds all non-deleted routes matching query criteria, supporting pagination, searching, filtering, and sorting.
   * 
   * @param {Object} options - Query options.
   * @param {number} [options.page=1] - Page number.
   * @param {number} [options.limit=10] - Number of items per page.
   * @param {string} [options.search=''] - Search term matching routeCode, routeName, origin, or destination.
   * @param {string} [options.status=''] - Filter by status (ACTIVE, INACTIVE).
   * @param {string} [options.type=''] - Filter by route type (EXPRESS, NORMAL, HIGHWAY).
   * @param {string} [options.sortBy='-createdAt'] - Sorting parameter.
   * @returns {Promise<Object>} Object containing routes list and pagination metadata.
   */
  async findAll({ page = 1, limit = 10, search = '', status = '', type = '', sortBy = '-createdAt' }) {
    try {
      const filter = { deletedAt: null };

      // 1. Text Search (matches routeCode, routeName, origin, or destination)
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter.$or = [
          { routeCode: searchRegex },
          { routeName: searchRegex },
          { origin: searchRegex },
          { destination: searchRegex }
        ];
      }

      // 2. Filters
      if (status) {
        filter.status = status;
      }
      if (type) {
        filter.type = type;
      }

      // 3. Sorting
      let sortOption = '-createdAt';
      const allowedSortFields = [
        'createdAt', '-createdAt',
        'routeName', '-routeName',
        'routeCode', '-routeCode',
        'distance', '-distance'
      ];
      if (sortBy && allowedSortFields.includes(sortBy)) {
        sortOption = sortBy;
      }

      // 4. Pagination
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const skip = (pageNum - 1) * limitNum;

      // 5. Query execution using Promise.all
      const [routes, totalItems] = await Promise.all([
        Route.find(filter)
          .sort(sortOption)
          .skip(skip)
          .limit(limitNum)
          .exec(),
        Route.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalItems / limitNum);

      return {
        routes,
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
      throw new Error(`Database error in findAll routes: ${error.message}`);
    }
  }

  /**
   * Updates an existing route.
   * 
   * @param {string} id - The MongoDB ID of the route to update.
   * @param {Object} data - The updated data.
   * @returns {Promise<Object|null>} The updated route document, or null if not found.
   */
  async update(id, data) {
    try {
      return await Route.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
      }).exec();
    } catch (error) {
      throw new Error(`Database error in update route: ${error.message}`);
    }
  }

  /**
   * Checks if an active route exists with the specified routeCode.
   * 
   * @param {string} routeCode - The route code.
   * @returns {Promise<boolean>} True if any match exists, false otherwise.
   */
  async exists(routeCode) {
    try {
      const result = await Route.exists({ routeCode, deletedAt: null });
      return !!result;
    } catch (error) {
      throw new Error(`Database error in exists route: ${error.message}`);
    }
  }

  /**
   * Checks if another active route exists with a duplicate field value, excluding a specific route ID.
   * Useful for validating update uniqueness.
   * 
   * @param {string} field - The field to check (e.g. 'routeCode').
   * @param {string} value - The candidate value.
   * @param {string} id - The ID of the route to exclude from verification.
   * @returns {Promise<boolean>} True if duplicate exists, false otherwise.
   */
  async existsExcludeId(field, value, id) {
    try {
      const query = {
        _id: { $ne: id },
        deletedAt: null,
        [field]: value
      };
      const result = await Route.exists(query);
      return !!result;
    } catch (error) {
      throw new Error(`Database error in existsExcludeId route: ${error.message}`);
    }
  }
}

module.exports = new RouteRepository();
