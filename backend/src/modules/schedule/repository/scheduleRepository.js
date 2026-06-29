/**
 * @file scheduleRepository.js
 * @description Encapsulates all database operations for the Schedule model, supporting conflict checking and paginated retrieval.
 */

const mongoose = require('mongoose');
const Schedule = require('../model/Schedule');
const Route = require('../../route/model/Route');
const ScheduleStatus = require('../../../constants/scheduleStatus');

class ScheduleRepository {
  /**
   * Creates and saves a new Schedule document.
   * 
   * @param {Object} scheduleData - The details of the schedule to create.
   * @returns {Promise<Object>} The saved schedule document.
   */
  async create(scheduleData) {
    try {
      const schedule = new Schedule(scheduleData);
      return await schedule.save();
    } catch (error) {
      throw new Error(`Database error in create schedule: ${error.message}`);
    }
  }

  /**
   * Finds a non-deleted schedule by its ID.
   * 
   * @param {string} id - The MongoDB ID of the schedule.
   * @returns {Promise<Object|null>} The schedule document, or null if not found.
   */
  async findById(id) {
    try {
      return await Schedule.findOne({ _id: id, deletedAt: null })
        .populate('busId')
        .populate('driverId')
        .populate('routeId')
        .exec();
    } catch (error) {
      throw new Error(`Database error in findById schedule: ${error.message}`);
    }
  }

  /**
   * Finds all non-deleted schedules matching query criteria, supporting pagination, searching, filtering, and sorting.
   * 
   * @param {Object} options - Query options.
   * @param {number} [options.page=1] - Page number.
   * @param {number} [options.limit=10] - Number of items per page.
   * @param {string} [options.search=''] - Search term matching scheduleCode.
   * @param {string} [options.status=''] - Filter by status.
   * @param {string} [options.busId=''] - Filter by busId.
   * @param {string} [options.driverId=''] - Filter by driverId.
   * @param {string} [options.routeId=''] - Filter by routeId.
   * @param {string} [options.travelDate=''] - Filter by travel date (compares full day range).
   * @param {string} [options.sortBy='travelDate'] - Sorting parameter.
   * @returns {Promise<Object>} Object containing schedules list and pagination metadata.
   */
  async findAll({ page = 1, limit = 10, search = '', status = '', busId = '', driverId = '', routeId = '', travelDate = '', origin = '', destination = '', sortBy = 'travelDate' }) {
    try {
      const filter = { deletedAt: null };

      // 1. Text Search (matches scheduleCode)
      if (search) {
        filter.scheduleCode = new RegExp(search, 'i');
      }

      // 2. Filters
      if (status) {
        filter.status = status;
      }
      if (busId) {
        filter.busId = busId;
      }
      if (driverId) {
        filter.driverId = driverId;
      }
      if (routeId) {
        filter.routeId = routeId;
      }

      // 2.5 Filter by origin / destination (case-insensitive regex match)
      if (origin || destination) {
        const RouteModel = Route;
        const routeQuery = { deletedAt: null };
        if (origin) {
          routeQuery.origin = new RegExp(origin.trim(), 'i');
        }
        if (destination) {
          routeQuery.destination = new RegExp(destination.trim(), 'i');
        }
        const matchingRoutes = await RouteModel.find(routeQuery).select('_id').exec();
        const routeIds = matchingRoutes.map(r => r._id);
        
        // If there are no routes matching, schedules result must be empty
        if (routeIds.length === 0) {
          return {
            schedules: [],
            pagination: {
              page: Math.max(1, parseInt(page)),
              limit: Math.max(1, parseInt(limit)),
              totalItems: 0,
              totalPages: 0,
              hasNext: false,
              hasPrevious: false
            }
          };
        }
        filter.routeId = { $in: routeIds };
      }

      // 3. Travel Date Filtering (matches start and end boundaries of the specified travelDate)
      if (travelDate) {
        const startOfDay = new Date(travelDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(travelDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        filter.travelDate = { $gte: startOfDay, $lte: endOfDay };
      }

      // 4. Sorting
      let sortOption = 'travelDate';
      const allowedSortFields = [
        'travelDate', '-travelDate',
        'departureTime', '-departureTime',
        'createdAt', '-createdAt'
      ];
      if (sortBy && allowedSortFields.includes(sortBy)) {
        sortOption = sortBy;
      }

      // 5. Pagination
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const skip = (pageNum - 1) * limitNum;

      // 6. Query execution using Promise.all
      const [schedules, totalItems] = await Promise.all([
        Schedule.find(filter)
          .populate('busId')
          .populate('driverId')
          .populate('routeId')
          .sort(sortOption)
          .skip(skip)
          .limit(limitNum)
          .exec(),
        Schedule.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalItems / limitNum);

      return {
        schedules,
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
      throw new Error(`Database error in findAll schedules: ${error.message}`);
    }
  }

  /**
   * Updates an existing schedule.
   * 
   * @param {string} id - The MongoDB ID of the schedule to update.
   * @param {Object} data - The updated data.
   * @returns {Promise<Object|null>} The updated schedule document, or null if not found.
   */
  async update(id, data) {
    try {
      return await Schedule.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
      })
      .populate('busId')
      .populate('driverId')
      .populate('routeId')
      .exec();
    } catch (error) {
      throw new Error(`Database error in update schedule: ${error.message}`);
    }
  }

  /**
   * Checks if an active schedule exists with the specified scheduleCode.
   * 
   * @param {string} scheduleCode - The schedule code to check.
   * @returns {Promise<boolean>} True if match exists, false otherwise.
   */
  async exists(scheduleCode) {
    try {
      const result = await Schedule.exists({ scheduleCode, deletedAt: null });
      return !!result;
    } catch (error) {
      throw new Error(`Database error in exists schedule: ${error.message}`);
    }
  }

  /**
   * Checks if another active schedule exists with a duplicate field value, excluding a specific ID.
   * Useful for validating update uniqueness.
   * 
   * @param {string} field - The field to check (e.g. 'scheduleCode').
   * @param {string} value - The candidate value.
   * @param {string} id - The ID of the schedule to exclude.
   * @returns {Promise<boolean>} True if duplicate exists, false otherwise.
   */
  async existsExcludeId(field, value, id) {
    try {
      const query = {
        _id: { $ne: id },
        deletedAt: null,
        [field]: value
      };
      const result = await Schedule.exists(query);
      return !!result;
    } catch (error) {
      throw new Error(`Database error in existsExcludeId schedule: ${error.message}`);
    }
  }

  /**
   * Checks if a bus has another active (non-cancelled) overlapping schedule.
   * Two intervals [d1, a1] and [d2, a2] overlap if: d1 < a2 AND d2 < a1.
   * 
   * @param {string} busId - The bus ID to verify.
   * @param {Date} departureTime - The candidate departure time.
   * @param {Date} arrivalTime - The candidate arrival time.
   * @param {string} [excludeScheduleId=null] - Optional schedule ID to exclude from verification.
   * @returns {Promise<boolean>} True if conflict exists, false otherwise.
   */
  async hasBusConflict(busId, departureTime, arrivalTime, excludeScheduleId = null) {
    try {
      const query = {
        busId,
        deletedAt: null,
        status: { $ne: ScheduleStatus.CANCELLED },
        departureTime: { $lt: arrivalTime },
        arrivalTime: { $gt: departureTime }
      };

      if (excludeScheduleId) {
        query._id = { $ne: excludeScheduleId };
      }

      const result = await Schedule.exists(query);
      return !!result;
    } catch (error) {
      throw new Error(`Database error in hasBusConflict: ${error.message}`);
    }
  }

  /**
   * Checks if a driver has another active (non-cancelled) overlapping schedule.
   * Two intervals [d1, a1] and [d2, a2] overlap if: d1 < a2 AND d2 < a1.
   * 
   * @param {string} driverId - The driver ID to verify.
   * @param {Date} departureTime - The candidate departure time.
   * @param {Date} arrivalTime - The candidate arrival time.
   * @param {string} [excludeScheduleId=null] - Optional schedule ID to exclude from verification.
   * @returns {Promise<boolean>} True if conflict exists, false otherwise.
   */
  async hasDriverConflict(driverId, departureTime, arrivalTime, excludeScheduleId = null) {
    try {
      const query = {
        driverId,
        deletedAt: null,
        status: { $ne: ScheduleStatus.CANCELLED },
        departureTime: { $lt: arrivalTime },
        arrivalTime: { $gt: departureTime }
      };

      if (excludeScheduleId) {
        query._id = { $ne: excludeScheduleId };
      }

      const result = await Schedule.exists(query);
      return !!result;
    } catch (error) {
      throw new Error(`Database error in hasDriverConflict: ${error.message}`);
    }
  }

  /**
   * Checks if there are active (non-cancelled) future schedules assigned to a specific Route ID.
   * Used for validating Route deletion safety.
   * 
   * @param {string} routeId - The route ID to check.
   * @returns {Promise<boolean>} True if future schedules exist, false otherwise.
   */
  async hasFutureSchedulesForRoute(routeId) {
    try {
      const query = {
        routeId,
        deletedAt: null,
        status: { $ne: ScheduleStatus.CANCELLED },
        travelDate: { $gte: new Date() } // Checks only future schedules
      };
      const result = await Schedule.exists(query);
      return !!result;
    } catch (error) {
      throw new Error(`Database error in hasFutureSchedulesForRoute: ${error.message}`);
    }
  }
}

module.exports = new ScheduleRepository();
