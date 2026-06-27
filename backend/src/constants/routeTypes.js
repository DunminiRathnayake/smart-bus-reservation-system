/**
 * @file routeTypes.js
 * @description Route type constants for the SmartGo system.
 */

const RouteTypes = {
  EXPRESS: 'EXPRESS',
  NORMAL: 'NORMAL',
  HIGHWAY: 'HIGHWAY'
};

// Freeze the object to prevent runtime modification
Object.freeze(RouteTypes);

module.exports = RouteTypes;
