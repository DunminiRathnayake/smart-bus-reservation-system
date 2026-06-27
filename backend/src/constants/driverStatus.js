/**
 * @file driverStatus.js
 * @description Driver status constants for the SmartGo system.
 */

const DriverStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ON_LEAVE: 'ON_LEAVE',
  SUSPENDED: 'SUSPENDED'
};

// Freeze the object to prevent runtime modification
Object.freeze(DriverStatus);

module.exports = DriverStatus;
