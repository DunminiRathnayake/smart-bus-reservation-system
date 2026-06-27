/**
 * @file Schedule.js
 * @description Mongoose Schema and Model definition for the Schedule domain.
 */

const mongoose = require('mongoose');
const ScheduleStatus = require('../../../constants/scheduleStatus');

const scheduleSchema = new mongoose.Schema(
  {
    scheduleCode: {
      type: String,
      required: [true, 'Schedule code is required'],
      trim: true
    },
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Bus ID is required']
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver ID is required']
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: [true, 'Route ID is required']
    },
    travelDate: {
      type: Date,
      required: [true, 'Travel date is required']
    },
    departureTime: {
      type: Date,
      required: [true, 'Departure time is required']
    },
    arrivalTime: {
      type: Date,
      required: [true, 'Arrival time is required']
    },
    boardingTime: {
      type: Date,
      required: [true, 'Boarding time is required']
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats count is required'],
      default: 0
    },
    availableSeats: {
      type: Number,
      required: [true, 'Available seats count is required'],
      default: 0
    },
    bookedSeats: {
      type: Number,
      required: [true, 'Booked seats count is required'],
      default: 0
    },
    status: {
      type: String,
      enum: {
        values: Object.values(ScheduleStatus),
        message: 'Invalid schedule status: {VALUE}'
      },
      required: [true, 'Status is required'],
      default: ScheduleStatus.SCHEDULED
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'schedules'
  }
);

// Partial unique index on scheduleCode to allow duplicates only for soft-deleted schedules
scheduleSchema.index(
  { scheduleCode: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
