/**
 * @file busService.js
 * @description Encapsulates all business logic for Bus Management (Sprint 4).
 */

const busRepository = require('../repository/busRepository');
const BusStatus = require('../../../constants/busStatus');

class BusService {
  /**
   * Creates a new bus.
   * 
   * @param {Object} busData - The details of the bus to create.
   * @param {string} createdById - The admin creating the bus.
   * @returns {Promise<Object>} The saved bus document.
   */
  async createBus(busData, createdById) {
    const { busNumber, registrationNumber, capacity } = busData;

    // 1. Validation: Capacity must be greater than 0
    if (capacity <= 0) {
      const error = new Error('Bus capacity must be greater than 0');
      error.statusCode = 400;
      throw error;
    }

    // 2. Validation: Uniqueness check for busNumber and registrationNumber
    const duplicateExists = await busRepository.exists(busNumber, registrationNumber);
    if (duplicateExists) {
      const error = new Error('Bus number or registration number is already in use by an active bus');
      error.statusCode = 400;
      throw error;
    }

    // 3. Set default available seats matching capacity on creation
    const payload = {
      ...busData,
      availableSeats: capacity,
      createdBy: createdById
    };

    return await busRepository.create(payload);
  }

  /**
   * Retrieves a bus by ID.
   * 
   * @param {string} id - The bus ID.
   * @returns {Promise<Object>} The bus document.
   */
  async getBus(id) {
    const bus = await busRepository.findById(id);
    if (!bus) {
      const error = new Error('Bus not found');
      error.statusCode = 404;
      throw error;
    }
    return bus;
  }

  /**
   * Retrieves all buses matching search/filters.
   * 
   * @param {Object} queryOptions - Pagination, searching, filtering, and sorting parameters.
   * @returns {Promise<Object>} List of buses and pagination details.
   */
  async getBuses(queryOptions) {
    return await busRepository.findAll(queryOptions);
  }

  /**
   * Updates bus details.
   * 
   * @param {string} id - The bus ID.
   * @param {Object} updateData - Data to update.
   * @param {string} updatedById - The admin performing the update.
   * @returns {Promise<Object>} The updated bus document.
   */
  async updateBus(id, updateData, updatedById) {
    const bus = await busRepository.findById(id);
    if (!bus) {
      const error = new Error('Bus not found');
      error.statusCode = 404;
      throw error;
    }

    // 1. Validation: Capacity check if provided
    if (updateData.capacity !== undefined && updateData.capacity <= 0) {
      const error = new Error('Bus capacity must be greater than 0');
      error.statusCode = 400;
      throw error;
    }

    // 2. Validation: Uniqueness checks excluding current bus ID
    if (updateData.busNumber) {
      const duplicateBusNumber = await busRepository.existsExcludeId('busNumber', updateData.busNumber, id);
      if (duplicateBusNumber) {
        const error = new Error('Bus number is already in use by another active bus');
        error.statusCode = 400;
        throw error;
      }
    }

    if (updateData.registrationNumber) {
      const duplicateRegNumber = await busRepository.existsExcludeId('registrationNumber', updateData.registrationNumber, id);
      if (duplicateRegNumber) {
        const error = new Error('Registration number is already in use by another active bus');
        error.statusCode = 400;
        throw error;
      }
    }

    const payload = {
      ...updateData,
      updatedBy: updatedById
    };

    // If capacity is updated, logically recalculate available seats (simplistic fallback helper)
    if (updateData.capacity !== undefined) {
      payload.availableSeats = updateData.capacity;
    }

    return await busRepository.update(id, payload);
  }

  /**
   * Updates bus status.
   * 
   * @param {string} id - The bus ID.
   * @param {string} status - New bus status.
   * @param {string} updatedById - The admin performing the status update.
   * @returns {Promise<Object>} The updated bus document.
   */
  async updateBusStatus(id, status, updatedById) {
    const bus = await busRepository.findById(id);
    if (!bus) {
      const error = new Error('Bus not found');
      error.statusCode = 404;
      throw error;
    }

    return await busRepository.update(id, { status, updatedBy: updatedById });
  }

  /**
   * Soft-deletes a bus.
   * 
   * @param {string} id - The bus ID.
   * @param {string} deletedById - The admin performing the delete.
   * @returns {Promise<Object>} The soft-deleted bus document.
   */
  async deleteBus(id, deletedById) {
    const bus = await busRepository.findById(id);
    if (!bus) {
      const error = new Error('Bus not found');
      error.statusCode = 404;
      throw error;
    }

    return await busRepository.update(id, {
      status: BusStatus.INACTIVE,
      deletedAt: new Date(),
      deletedBy: deletedById
    });
  }

  /**
   * Helper function checking if a bus is eligible to be scheduled.
   * A bus must exist, be ACTIVE, and not in MAINTENANCE/INACTIVE.
   * 
   * @param {string} busId - The bus ID to inspect.
   * @returns {Promise<boolean>} True if bus is ACTIVE and available, false otherwise.
   */
  async isBusAvailableForSchedule(busId) {
    const bus = await busRepository.findById(busId);
    if (!bus) return false;
    return bus.status === BusStatus.ACTIVE;
  }
}

module.exports = new BusService();
