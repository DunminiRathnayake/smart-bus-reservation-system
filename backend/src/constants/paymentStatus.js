/**
 * @file paymentStatus.js
 * @description Payment status constants for the SmartGo system.
 */

const PaymentStatus = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED'
};

// Freeze the object to prevent runtime modification
Object.freeze(PaymentStatus);

module.exports = PaymentStatus;
