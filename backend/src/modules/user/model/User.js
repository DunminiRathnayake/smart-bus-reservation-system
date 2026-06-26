/**
 * @file User.js
 * @description Mongoose Schema and Model definition for the User domain.
 */

const mongoose = require('mongoose');
const Roles = require('../../../constants/roles');

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
      unique: true,
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
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
