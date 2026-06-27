/**
 * @file gender.js
 * @description Gender constants for the SmartGo system.
 */

const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER'
};

// Freeze the object to prevent runtime modification
Object.freeze(Gender);

module.exports = Gender;
