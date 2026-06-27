/**
 * @file Driver.js
 * @description Mongoose Schema and Model definition for the Driver domain.
 */

const mongoose = require('mongoose');
const Gender = require('../../../constants/gender');
const DriverStatus = require('../../../constants/driverStatus');

const driverSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      trim: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    nic: {
      type: String,
      required: [true, 'NIC is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    gender: {
      type: String,
      enum: {
        values: Object.values(Gender),
        message: 'Invalid gender: {VALUE}'
      },
      required: [true, 'Gender is required']
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required']
    },
    experienceYears: {
      type: Number,
      required: [true, 'Experience years is required'],
      min: [0, 'Experience years cannot be negative']
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      trim: true
    },
    licenseExpiry: {
      type: Date,
      required: [true, 'License expiry date is required']
    },
    profileImage: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: {
        values: Object.values(DriverStatus),
        message: 'Invalid status: {VALUE}'
      },
      required: [true, 'Status is required'],
      default: DriverStatus.ACTIVE
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
    collection: 'drivers'
  }
);

// Partial unique index on employeeId to allow duplicates only for soft-deleted drivers
driverSchema.index(
  { employeeId: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

// Partial unique index on nic to allow duplicates only for soft-deleted drivers
driverSchema.index(
  { nic: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

// Partial unique index on licenseNumber to allow duplicates only for soft-deleted drivers
driverSchema.index(
  { licenseNumber: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
