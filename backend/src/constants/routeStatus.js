/**
 * @file routeStatus.js
 * @description Route status constants for the SmartGo system.
 */

const RouteStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

// Freeze the object to prevent runtime modification
Object.freeze(RouteStatus);

module.exports = RouteStatus;
