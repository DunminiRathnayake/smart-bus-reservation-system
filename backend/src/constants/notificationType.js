/**
 * @file notificationType.js
 * @description Notification type constants for the SmartGo system.
 */

const NotificationType = {
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  PAYMENT_REFUNDED: 'PAYMENT_REFUNDED',
  SCHEDULE_CANCELLED: 'SCHEDULE_CANCELLED',
  SYSTEM: 'SYSTEM'
};

// Freeze the object to prevent runtime modification
Object.freeze(NotificationType);

module.exports = NotificationType;
