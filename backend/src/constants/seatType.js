/**
 * @file seatType.js
 * @description Seat type constants for the SmartGo system.
 */

const SeatType = {
  WINDOW: 'WINDOW',
  AISLE: 'AISLE',
  MIDDLE: 'MIDDLE'
};

// Freeze the object to prevent runtime modification
Object.freeze(SeatType);

module.exports = SeatType;
