/**
 * @file driverService.js
 * @description Encapsulates all business logic for Driver Management (Sprint 5).
 */

const driverRepository = require('../repository/driverRepository');
const DriverStatus = require('../../../constants/driverStatus');

class DriverService {
  /**
   * Creates a new driver.
   * 
   * @param {Object} driverData - The details of the driver to create.
   * @param {string} createdById - The admin creating the driver.
   * @returns {Promise<Object>} The saved driver document.
   */
  async createDriver(driverData, createdById) {
    const { employeeId, nic, licenseNumber, experienceYears } = driverData;

    // 1. Validation: Experience years cannot be negative
    if (experienceYears !== undefined && experienceYears < 0) {
      const error = new Error('Experience years cannot be negative');
      error.statusCode = 400;
      throw error;
    }

    // 2. Validation: Uniqueness check for employeeId, nic, and licenseNumber
    const duplicateExists = await driverRepository.exists(employeeId, nic, licenseNumber);
    if (duplicateExists) {
      const error = new Error('Employee ID, NIC, or License Number is already in use by an active driver');
      error.statusCode = 400;
      throw error;
    }

    const payload = {
      ...driverData,
      createdBy: createdById
    };

    return await driverRepository.create(payload);
  }

  /**
   * Retrieves a driver by ID.
   * 
   * @param {string} id - The driver ID.
   * @returns {Promise<Object>} The driver document.
   */
  async getDriver(id) {
    const driver = await driverRepository.findById(id);
    if (!driver) {
      const error = new Error('Driver not found');
      error.statusCode = 404;
      throw error;
    }
    return driver;
  }

  /**
   * Retrieves all drivers matching search/filters.
   * 
   * @param {Object} queryOptions - Pagination, searching, filtering, and sorting parameters.
   * @returns {Promise<Object>} List of drivers and pagination details.
   */
  async getDrivers(queryOptions) {
    return await driverRepository.findAll(queryOptions);
  }

  /**
   * Updates driver details.
   * 
   * @param {string} id - The driver ID.
   * @param {Object} updateData - Data to update.
   * @param {string} updatedById - The admin performing the update.
   * @returns {Promise<Object>} The updated driver document.
   */
  async updateDriver(id, updateData, updatedById) {
    const driver = await driverRepository.findById(id);
    if (!driver) {
      const error = new Error('Driver not found');
      error.statusCode = 404;
      throw error;
    }

    // 1. Validation: Experience check if provided
    if (updateData.experienceYears !== undefined && updateData.experienceYears < 0) {
      const error = new Error('Experience years cannot be negative');
      error.statusCode = 400;
      throw error;
    }

    // 2. Validation: Uniqueness checks excluding current driver ID
    if (updateData.employeeId) {
      const duplicateEmpId = await driverRepository.existsExcludeId('employeeId', updateData.employeeId, id);
      if (duplicateEmpId) {
        const error = new Error('Employee ID is already in use by another active driver');
        error.statusCode = 400;
        throw error;
      }
    }

    if (updateData.nic) {
      const duplicateNic = await driverRepository.existsExcludeId('nic', updateData.nic, id);
      if (duplicateNic) {
        const error = new Error('NIC is already in use by another active driver');
        error.statusCode = 400;
        throw error;
      }
    }

    if (updateData.licenseNumber) {
      const duplicateLicense = await driverRepository.existsExcludeId('licenseNumber', updateData.licenseNumber, id);
      if (duplicateLicense) {
        const error = new Error('License number is already in use by another active driver');
        error.statusCode = 400;
        throw error;
      }
    }

    const payload = {
      ...updateData,
      updatedBy: updatedById
    };

    return await driverRepository.update(id, payload);
  }

  /**
   * Updates driver status.
   * 
   * @param {string} id - The driver ID.
   * @param {string} status - New status.
   * @param {string} updatedById - The admin performing the status update.
   * @returns {Promise<Object>} The updated driver document.
   */
  async updateDriverStatus(id, status, updatedById) {
    const driver = await driverRepository.findById(id);
    if (!driver) {
      const error = new Error('Driver not found');
      error.statusCode = 404;
      throw error;
    }

    return await driverRepository.update(id, { status, updatedBy: updatedById });
  }

  /**
   * Soft-deletes a driver.
   * 
   * @param {string} id - The driver ID.
   * @param {string} deletedById - The admin performing the delete.
   * @returns {Promise<Object>} The soft-deleted driver document.
   */
  async deleteDriver(id, deletedById) {
    const driver = await driverRepository.findById(id);
    if (!driver) {
      const error = new Error('Driver not found');
      error.statusCode = 404;
      throw error;
    }

    return await driverRepository.update(id, {
      status: DriverStatus.INACTIVE,
      deletedAt: new Date(),
      deletedBy: deletedById
    });
  }

  /**
   * Helper function checking if a driver is eligible to be scheduled.
   * Drivers with status INACTIVE or SUSPENDED are unavailable.
   * 
   * @param {string} driverId - The driver ID to inspect.
   * @returns {Promise<boolean>} True if driver is available, false otherwise.
   */
  async isDriverAvailableForSchedule(driverId) {
    const driver = await driverRepository.findById(driverId);
    if (!driver) return false;
    
    // Drivers with INACTIVE or SUSPENDED status are unavailable (ACTIVE or ON_LEAVE are available)
    return driver.status !== DriverStatus.INACTIVE && driver.status !== DriverStatus.SUSPENDED;
  }
}

module.exports = new DriverService();
