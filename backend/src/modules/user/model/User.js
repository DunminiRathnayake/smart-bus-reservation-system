/**
 * @file User.js
 * @description Mongoose Schema and Model definition for the User domain.
 */

const mongoose = require('mongoose');
const Roles = require('../../../constants/roles');
const UserStatus = require('../../../constants/userStatus');

const userSchema = new mongoose.Schema(
  {
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
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false // Excludes password by default from queries
    },
    role: {
      type: String,
      enum: {
        values: Object.values(Roles),
        message: 'Invalid role: {VALUE}'
      },
      required: [true, 'Role is required'],
      default: Roles.PASSENGER
    },
    status: {
      type: String,
      enum: {
        values: Object.values(UserStatus),
        message: 'Invalid status: {VALUE}'
      },
      required: [true, 'Status is required'],
      default: UserStatus.ACTIVE
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
    collection: 'users'
  }
);

// Partial unique index on email to allow duplicates only for soft-deleted users
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
