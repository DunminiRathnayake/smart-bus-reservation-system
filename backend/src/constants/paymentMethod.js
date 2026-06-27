/**
 * @file paymentMethod.js
 * @description Payment method constants for the SmartGo system.
 */

const PaymentMethod = {
  CARD: 'CARD',
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  ONLINE: 'ONLINE'
};

// Freeze the object to prevent runtime modification
Object.freeze(PaymentMethod);

module.exports = PaymentMethod;
