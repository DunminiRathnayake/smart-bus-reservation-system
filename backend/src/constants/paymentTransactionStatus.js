/**
 * @file paymentTransactionStatus.js
 * @description Payment transaction status constants for the SmartGo system.
 */

const PaymentTransactionStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

// Freeze the object to prevent runtime modification
Object.freeze(PaymentTransactionStatus);

module.exports = PaymentTransactionStatus;
