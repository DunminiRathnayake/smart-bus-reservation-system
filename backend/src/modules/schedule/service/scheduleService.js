/**
 * @file scheduleService.js
 * @description Encapsulates all business logic for Schedule Management (Sprint 7).
 */

const scheduleRepository = require('../repository/scheduleRepository');
const busService = require('../../bus/service/busService');
const driverService = require('../../driver/service/driverService');
const routeService = require('../../route/service/routeService');
const ScheduleStatus = require('../../../constants/scheduleStatus');

class ScheduleService {
  /**
   * Creates a new trip schedule.
   * Enforces availability controls, conflict overlaps, and seats calculations.
   * 
   * @param {Object} scheduleData - The details of the schedule to create.
   * @param {string} createdById - The admin creating the schedule.
   * @returns {Promise<Object>} The saved schedule document.
   */
  async createSchedule(scheduleData, createdById) {
    const { scheduleCode, busId, driverId, routeId, travelDate, departureTime, arrivalTime, boardingTime } = scheduleData;

    // 1. Convert string dates to Date objects
    const travelDateObj = new Date(travelDate);
    const departureTimeObj = new Date(departureTime);
    const arrivalTimeObj = new Date(arrivalTime);
    const boardingTimeObj = new Date(boardingTime);

    // 2. Validation: Time order constraints
    if (departureTimeObj >= arrivalTimeObj) {
      const error = new Error('Arrival time must be after departure time');
      error.statusCode = 400;
      throw error;
    }
    if (boardingTimeObj >= departureTimeObj) {
      const error = new Error('Boarding time must be before departure time');
      error.statusCode = 400;
      throw error;
    }

    // 3. Validation: Unique check for scheduleCode
    const duplicateExists = await scheduleRepository.exists(scheduleCode);
    if (duplicateExists) {
      const error = new Error('Schedule code is already in use by an active schedule');
      error.statusCode = 400;
      throw error;
    }

    // 4. Validation: Verify Bus availability and get capacity details
    const isBusAvailable = await busService.isBusAvailableForSchedule(busId);
    if (!isBusAvailable) {
      const error = new Error('Selected bus is not available (inactive or in maintenance)');
      error.statusCode = 400;
      throw error;
    }
    const bus = await busService.getBus(busId);

    // 5. Validation: Verify Driver availability
    const isDriverAvailable = await driverService.isDriverAvailableForSchedule(driverId);
    if (!isDriverAvailable) {
      const error = new Error('Selected driver is not available (inactive or suspended)');
      error.statusCode = 400;
      throw error;
    }

    // 6. Validation: Verify Route availability
    const isRouteAvailable = await routeService.isRouteAvailable(routeId);
    if (!isRouteAvailable) {
      const error = new Error('Selected route is not active or not found');
      error.statusCode = 400;
      throw error;
    }

    // 7. Validation: Verify Bus overlapping conflicts
    const busConflict = await scheduleRepository.hasBusConflict(busId, departureTimeObj, arrivalTimeObj);
    if (busConflict) {
      const error = new Error('Selected bus is already scheduled for another active trip during this time range');
      error.statusCode = 400;
      throw error;
    }

    // 8. Validation: Verify Driver overlapping conflicts
    const driverConflict = await scheduleRepository.hasDriverConflict(driverId, departureTimeObj, arrivalTimeObj);
    if (driverConflict) {
      const error = new Error('Selected driver is already scheduled for another active trip during this time range');
      error.statusCode = 400;
      throw error;
    }

    const payload = {
      ...scheduleData,
      travelDate: travelDateObj,
      departureTime: departureTimeObj,
      arrivalTime: arrivalTimeObj,
      boardingTime: boardingTimeObj,
      totalSeats: bus.capacity,
      availableSeats: bus.capacity,
      bookedSeats: 0,
      createdBy: createdById
    };

    const schedule = await scheduleRepository.create(payload);

    // Automatically generate seats for the schedule
    const seatService = require('../../seat/service/seatService');
    await seatService.generateSeats(schedule._id);

    return schedule;
  }

  /**
   * Retrieves a schedule by ID.
   * 
   * @param {string} id - The schedule ID.
   * @returns {Promise<Object>} The schedule document.
   */
  async getSchedule(id) {
    const schedule = await scheduleRepository.findById(id);
    if (!schedule) {
      const error = new Error('Schedule not found');
      error.statusCode = 404;
      throw error;
    }
    return schedule;
  }

  /**
   * Retrieves all schedules matching filters.
   * 
   * @param {Object} queryOptions - Pagination, searching, filtering, and sorting parameters.
   * @returns {Promise<Object>} List of schedules and pagination metadata.
   */
  async getSchedules(queryOptions) {
    return await scheduleRepository.findAll(queryOptions);
  }

  /**
   * Updates an existing schedule details.
   * Enforces cross-module validations and conflict checks dynamically if fields change.
   * 
   * @param {string} id - The schedule ID.
   * @param {Object} updateData - Updatable values.
   * @param {string} updatedById - The admin performing the update.
   * @returns {Promise<Object>} The updated schedule document.
   */
  async updateSchedule(id, updateData, updatedById) {
    const schedule = await scheduleRepository.findById(id);
    if (!schedule) {
      const error = new Error('Schedule not found');
      error.statusCode = 404;
      throw error;
    }

    // Collate final times for logic checks (fall back to database values if not supplied in update payload)
    const departureTime = updateData.departureTime !== undefined ? updateData.departureTime : schedule.departureTime;
    const arrivalTime = updateData.arrivalTime !== undefined ? updateData.arrivalTime : schedule.arrivalTime;
    const boardingTime = updateData.boardingTime !== undefined ? updateData.boardingTime : schedule.boardingTime;
    const travelDate = updateData.travelDate !== undefined ? updateData.travelDate : schedule.travelDate;

    const departureTimeObj = new Date(departureTime);
    const arrivalTimeObj = new Date(arrivalTime);
    const boardingTimeObj = new Date(boardingTime);
    const travelDateObj = new Date(travelDate);

    // 1. Validation: Time order constraints
    if (departureTimeObj >= arrivalTimeObj) {
      const error = new Error('Arrival time must be after departure time');
      error.statusCode = 400;
      throw error;
    }
    if (boardingTimeObj >= departureTimeObj) {
      const error = new Error('Boarding time must be before departure time');
      error.statusCode = 400;
      throw error;
    }

    // 2. Validation: Unique check for scheduleCode excluding this ID
    if (updateData.scheduleCode) {
      const duplicateExists = await scheduleRepository.existsExcludeId('scheduleCode', updateData.scheduleCode, id);
      if (duplicateExists) {
        const error = new Error('Schedule code is already in use by another active schedule');
        error.statusCode = 400;
        throw error;
      }
    }

    const payload = {
      ...updateData,
      departureTime: departureTimeObj,
      arrivalTime: arrivalTimeObj,
      boardingTime: boardingTimeObj,
      travelDate: travelDateObj,
      updatedBy: updatedById
    };

    // 3. Validation: Bus change or timing changes
    const isBusChanging = updateData.busId && updateData.busId.toString() !== schedule.busId.toString();
    const isTimeChanging = 
      departureTimeObj.getTime() !== schedule.departureTime.getTime() || 
      arrivalTimeObj.getTime() !== schedule.arrivalTime.getTime();

    if (isBusChanging || isTimeChanging) {
      const targetBusId = updateData.busId || schedule.busId;

      if (isBusChanging) {
        const isBusAvailable = await busService.isBusAvailableForSchedule(targetBusId);
        if (!isBusAvailable) {
          const error = new Error('Selected bus is not available (inactive or in maintenance)');
          error.statusCode = 400;
          throw error;
        }
        const bus = await busService.getBus(targetBusId);
        payload.totalSeats = bus.capacity;
        payload.availableSeats = bus.capacity - schedule.bookedSeats;

        if (payload.availableSeats < 0) {
          const error = new Error('Cannot assign bus: new bus capacity is less than currently booked seats');
          error.statusCode = 400;
          throw error;
        }
      }

      // Check for overlap conflict excluding this schedule ID
      const busConflict = await scheduleRepository.hasBusConflict(targetBusId, departureTimeObj, arrivalTimeObj, id);
      if (busConflict) {
        const error = new Error('Selected bus is already scheduled for another active trip during this time range');
        error.statusCode = 400;
        throw error;
      }
    }

    // 4. Validation: Driver change or timing changes
    const isDriverChanging = updateData.driverId && updateData.driverId.toString() !== schedule.driverId.toString();
    if (isDriverChanging || isTimeChanging) {
      const targetDriverId = updateData.driverId || schedule.driverId;

      if (isDriverChanging) {
        const isDriverAvailable = await driverService.isDriverAvailableForSchedule(targetDriverId);
        if (!isDriverAvailable) {
          const error = new Error('Selected driver is not available (inactive or suspended)');
          error.statusCode = 400;
          throw error;
        }
      }

      // Check for overlap conflict excluding this schedule ID
      const driverConflict = await scheduleRepository.hasDriverConflict(targetDriverId, departureTimeObj, arrivalTimeObj, id);
      if (driverConflict) {
        const error = new Error('Selected driver is already scheduled for another active trip during this time range');
        error.statusCode = 400;
        throw error;
      }
    }

    // 5. Validation: Route change
    if (updateData.routeId && updateData.routeId.toString() !== schedule.routeId.toString()) {
      const isRouteAvailable = await routeService.isRouteAvailable(updateData.routeId);
      if (!isRouteAvailable) {
        const error = new Error('Selected route is not active or not found');
        error.statusCode = 400;
        throw error;
      }
    }

    return await scheduleRepository.update(id, payload);
  }

  /**
   * Updates schedule status.
   * 
   * @param {string} id - The schedule ID.
   * @param {string} status - New schedule status.
   * @param {string} updatedById - The admin performing the status update.
   * @returns {Promise<Object>} The updated schedule document.
   */
  async updateScheduleStatus(id, status, updatedById) {
    const schedule = await scheduleRepository.findById(id);
    if (!schedule) {
      const error = new Error('Schedule not found');
      error.statusCode = 404;
      throw error;
    }

    return await scheduleRepository.update(id, { status, updatedBy: updatedById });
  }

  /**
   * Soft-deletes a schedule by ID.
   * Sets status = CANCELLED, deletedAt, and deletedBy.
   * 
   * @param {string} id - The schedule ID.
   * @param {string} deletedById - The admin performing the delete.
   * @returns {Promise<Object>} The soft-deleted schedule document.
   */
  async deleteSchedule(id, deletedById) {
    const schedule = await scheduleRepository.findById(id);
    if (!schedule) {
      const error = new Error('Schedule not found');
      error.statusCode = 404;
      throw error;
    }

    return await scheduleRepository.update(id, {
      status: ScheduleStatus.CANCELLED,
      deletedAt: new Date(),
      deletedBy: deletedById
    });
  }
}

module.exports = new ScheduleService();
