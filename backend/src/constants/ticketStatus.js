/**
 * @file ticketStatus.js
 * @description Ticket status constants for the SmartGo system.
 */

const TicketStatus = {
  ACTIVE: 'ACTIVE',
  USED: 'USED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

// Freeze the object to prevent runtime modification
Object.freeze(TicketStatus);

module.exports = TicketStatus;
