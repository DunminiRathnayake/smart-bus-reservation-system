/**
 * @file seatService.js
 * @description Encapsulates all business logic for Seat Management (Sprint 8).
 */

const seatRepository = require('../repository/seatRepository');
const SeatStatus = require('../../../constants/seatStatus');
const SeatType = require('../../../constants/seatType');

class SeatService {
  /**
   * Automatically generates seats for a schedule based on the assigned bus capacity.
   * 
   * @param {string} scheduleId - The schedule ID.
   * @returns {Promise<Array<Object>>} The created seat documents.
   */
  async generateSeats(scheduleId) {
    // 1. Validate if seats already generated for this schedule
    const seatsExist = await seatRepository.exists(scheduleId);
    if (seatsExist) {
      const error = new Error('Seats have already been generated for this schedule');
      error.statusCode = 400;
      throw error;
    }

    // 2. Dynamically require schedule and bus repositories to retrieve details
    const scheduleRepository = require('../../schedule/repository/scheduleRepository');
    const busRepository = require('../../bus/repository/busRepository');

    const schedule = await scheduleRepository.findById(scheduleId);
    if (!schedule) {
      const error = new Error('Schedule not found');
      error.statusCode = 404;
      throw error;
    }

    const bus = await busRepository.findById(schedule.busId);
    if (!bus) {
      const error = new Error('Bus associated with this schedule not found');
      error.statusCode = 404;
      throw error;
    }

    // 3. Generate seats dynamically based on bus capacity
    const capacity = bus.capacity;
    const seats = [];

    for (let N = 1; N <= capacity; N++) {
      let rowNum, colLetter, seatType;
      if (N === 49) {
        rowNum = 12;
        colLetter = 'E'; // Center Back
        seatType = SeatType.MIDDLE;
      } else {
        rowNum = Math.floor((N - 1) / 4) + 1;
        const rem = (N - 1) % 4;
        if (rem === 0) {
          colLetter = 'D'; // Right Window
          seatType = SeatType.WINDOW;
        } else if (rem === 1) {
          colLetter = 'C'; // Right Aisle
          seatType = SeatType.AISLE;
        } else if (rem === 2) {
          colLetter = 'A'; // Left Window
          seatType = SeatType.WINDOW;
        } else if (rem === 3) {
          colLetter = 'B'; // Left Aisle
          seatType = SeatType.AISLE;
        }
      }

      seats.push({
        scheduleId,
        seatNumber: N.toString(),
        row: rowNum.toString(),
        column: colLetter,
        deck: 1,
        seatType,
        status: SeatStatus.AVAILABLE
      });
    }

    return await seatRepository.createMany(seats);
  }

  /**
   * Retrieves seats for a schedule.
   * 
   * @param {string} scheduleId - The schedule ID.
   * @param {string} [status] - Optional status filter.
   * @returns {Promise<Array<Object>>} List of seats.
   */
  async getSeats(scheduleId, status) {
    return await seatRepository.findBySchedule(scheduleId, status);
  }

  /**
   * Retrieves details of a specific seat.
   * 
   * @param {string} scheduleId - The schedule ID.
   * @param {string} seatId - The seat ID.
   * @returns {Promise<Object>} The seat document.
   */
  async getSeat(scheduleId, seatId) {
    const seat = await seatRepository.findById(seatId);
    if (!seat || seat.scheduleId.toString() !== scheduleId.toString()) {
      const error = new Error('Seat not found on this schedule');
      error.statusCode = 404;
      throw error;
    }
    return seat;
  }

  /**
   * Updates status of a seat.
   * 
   * @param {string} scheduleId - The schedule ID.
   * @param {string} seatId - The seat ID.
   * @param {string} status - New seat status.
   * @returns {Promise<Object>} The updated seat document.
   */
  async updateSeatStatus(scheduleId, seatId, status) {
    const seat = await this.getSeat(scheduleId, seatId);

    // Enforce business rules: BOOKED seats cannot be modified
    if (seat.status === SeatStatus.BOOKED) {
      const error = new Error('Booked seats cannot be modified');
      error.statusCode = 400;
      throw error;
    }

    return await seatRepository.updateSeatStatus(scheduleId, seatId, status);
  }

  /**
   * Deletes all seats for a schedule.
   * 
   * @param {string} scheduleId - The schedule ID.
   * @returns {Promise<Object>} Deletion result details.
   */
  async deleteSeats(scheduleId) {
    const seats = await seatRepository.findBySchedule(scheduleId);
    
    // Check if any seat is booked
    const hasBooked = seats.some(s => s.status === SeatStatus.BOOKED);
    if (hasBooked) {
      const error = new Error('Cannot delete seats: some seats are already booked');
      error.statusCode = 400;
      throw error;
    }

    return await seatRepository.deleteBySchedule(scheduleId);
  }
}

module.exports = new SeatService();
