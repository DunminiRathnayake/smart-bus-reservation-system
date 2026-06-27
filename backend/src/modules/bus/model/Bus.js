/**
 * @file Bus.js
 * @description Mongoose Schema and Model definition for the Bus domain.
 */

const mongoose = require('mongoose');
const BusTypes = require('../../../constants/busTypes');
const BusStatus = require('../../../constants/busStatus');

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: [true, 'Bus number is required'],
      trim: true
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      trim: true
    },
    busName: {
      type: String,
      required: [true, 'Bus name is required'],
      trim: true
    },
    type: {
      type: String,
      enum: {
        values: Object.values(BusTypes),
        message: 'Invalid bus type: {VALUE}'
      },
      required: [true, 'Bus type is required']
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be greater than 0']
    },
    availableSeats: {
      type: Number,
      required: [true, 'Available seats count is required'],
      min: [0, 'Available seats cannot be negative']
    },
    amenities: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: {
        values: Object.values(BusStatus),
        message: 'Invalid bus status: {VALUE}'
      },
      required: [true, 'Bus status is required'],
      default: BusStatus.ACTIVE
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
    collection: 'buses'
  }
);

// Partial unique index on busNumber to allow duplicates only for soft-deleted buses
busSchema.index(
  { busNumber: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

// Partial unique index on registrationNumber to allow duplicates only for soft-deleted buses
busSchema.index(
  { registrationNumber: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

const Bus = mongoose.model('Bus', busSchema);

module.exports = Bus;
