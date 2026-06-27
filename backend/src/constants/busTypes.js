/**
 * @file busTypes.js
 * @description Bus type constants for the SmartGo system.
 */

const BusTypes = {
  AC: 'AC',
  NON_AC: 'NON_AC',
  SEMI_LUXURY: 'SEMI_LUXURY',
  LUXURY: 'LUXURY',
  SLEEPER: 'SLEEPER'
};

// Freeze the object to prevent runtime modification
Object.freeze(BusTypes);

module.exports = BusTypes;
