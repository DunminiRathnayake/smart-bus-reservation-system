/**
 * @file seatRepository.js
 * @description Encapsulates all database operations for the Seat model, supporting batch creations, filters, and status updates.
 */

const Seat = require('../model/Seat');

class SeatRepository {
  /**
   * Batch inserts an array of Seat documents.
   * 
   * @param {Array<Object>} seats - The seats data to create.
   * @returns {Promise<Array<Object>>} The created seat documents.
   */
  async createMany(seats) {
    try {
      return await Seat.insertMany(seats);
    } catch (error) {
      throw new Error(`Database error in createMany seats: ${error.message}`);
    }
  }

  /**
   * Finds a seat by its ID.
   * 
   * @param {string} id - The MongoDB ID of the seat.
   * @returns {Promise<Object|null>} The seat document, or null if not found.
   */
  async findById(id) {
    try {
      return await Seat.findById(id).exec();
    } catch (error) {
      throw new Error(`Database error in findById seat: ${error.message}`);
    }
  }

  /**
   * Finds all seats assigned to a specific schedule, supporting status filtering and sorting.
   * 
   * @param {string} scheduleId - The target schedule ID.
   * @param {string} [status=''] - Optional status filter (AVAILABLE, HELD, BOOKED, BLOCKED).
   * @param {string} [sortBy='seatNumber'] - Sorting field.
   * @returns {Promise<Array<Object>>} Array of seat documents.
   */
  async findBySchedule(scheduleId, status = '', sortBy = 'seatNumber') {
    try {
      const filter = { scheduleId };
      if (status) {
        filter.status = status;
      }
      return await Seat.find(filter).populate('passengerId').sort(sortBy).exec();
    } catch (error) {
      throw new Error(`Database error in findBySchedule seats: ${error.message}`);
    }
  }

  /**
   * Updates status for a specific seat on a schedule.
   * 
   * @param {string} scheduleId - The schedule ID.
   * @param {string} seatId - The seat ID.
   * @param {string} status - The new seat status.
   * @returns {Promise<Object|null>} The updated seat document, or null if not found.
   */
  async updateSeatStatus(scheduleId, seatId, status) {
    try {
      return await Seat.findOneAndUpdate(
        { _id: seatId, scheduleId },
        { status },
        { new: true, runValidators: true }
      ).exec();
    } catch (error) {
      throw new Error(`Database error in updateSeatStatus: ${error.message}`);
    }
  }

  /**
   * Deletes all seats for a specific schedule.
   * 
   * @param {string} scheduleId - The schedule ID.
   * @returns {Promise<Object>} Deletion query result details.
   */
  async deleteBySchedule(scheduleId) {
    try {
      return await Seat.deleteMany({ scheduleId }).exec();
    } catch (error) {
      throw new Error(`Database error in deleteBySchedule seats: ${error.message}`);
    }
  }

  /**
   * Checks if any seat exists for the schedule ID.
   * Useful for preventing duplicate seat generation.
   * 
   * @param {string} scheduleId - The schedule ID.
   * @returns {Promise<boolean>} True if any seat exists, false otherwise.
   */
  async exists(scheduleId) {
    try {
      const result = await Seat.exists({ scheduleId });
      return !!result;
    } catch (error) {
      throw new Error(`Database error in exists seats: ${error.message}`);
    }
  }
}

module.exports = new SeatRepository();
