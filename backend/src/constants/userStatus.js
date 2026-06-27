/**
 * @file userStatus.js
 * @description User status constants for the SmartGo system.
 */

const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED'
};

// Freeze the object to prevent runtime modification
Object.freeze(UserStatus);

module.exports = UserStatus;
