/**
 * @file busStatus.js
 * @description Bus status constants for the SmartGo system.
 */

const BusStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE'
};

// Freeze the object to prevent runtime modification
Object.freeze(BusStatus);

module.exports = BusStatus;
