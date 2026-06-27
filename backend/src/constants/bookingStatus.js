/**
 * @file bookingStatus.js
 * @description Booking status constants for the SmartGo system.
 */

const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

// Freeze the object to prevent runtime modification
Object.freeze(BookingStatus);

module.exports = BookingStatus;
