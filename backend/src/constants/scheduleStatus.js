/**
 * @file scheduleStatus.js
 * @description Schedule status constants for the SmartGo system.
 */

const ScheduleStatus = {
  SCHEDULED: 'SCHEDULED',
  BOARDING: 'BOARDING',
  DEPARTED: 'DEPARTED',
  ARRIVED: 'ARRIVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

// Freeze the object to prevent runtime modification
Object.freeze(ScheduleStatus);

module.exports = ScheduleStatus;
