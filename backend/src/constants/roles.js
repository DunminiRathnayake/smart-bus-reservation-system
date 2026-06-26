/**
 * @file roles.js
 * @description User role constants for the SmartGo system.
 */

const Roles = {
  ADMIN: 'ADMIN',
  PASSENGER: 'PASSENGER',
  CONDUCTOR: 'CONDUCTOR'
};

// Freeze the object to prevent runtime modification
Object.freeze(Roles);

module.exports = Roles;
