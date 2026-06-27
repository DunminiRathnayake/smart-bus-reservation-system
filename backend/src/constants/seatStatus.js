/**
 * @file seatStatus.js
 * @description Seat status constants for the SmartGo system.
 */

const SeatStatus = {
  AVAILABLE: 'AVAILABLE',
  HELD: 'HELD',
  BOOKED: 'BOOKED',
  BLOCKED: 'BLOCKED'
};

// Freeze the object to prevent runtime modification
Object.freeze(SeatStatus);

module.exports = SeatStatus;
