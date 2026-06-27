/**
 * @file Booking.js
 * @description Mongoose Schema and Model definition for the Booking domain.
 */

const mongoose = require('mongoose');
const BookingStatus = require('../../../constants/bookingStatus');
const PaymentStatus = require('../../../constants/paymentStatus');

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      required: [true, 'Booking code is required'],
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      required: [true, 'Schedule ID is required']
    },
    seatIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Seat'
        }
      ],
      required: [true, 'Seat IDs are required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A booking must have at least one seat ID'
      }
    },
    passengerName: {
      type: String,
      required: [true, 'Passenger name is required'],
      trim: true
    },
    passengerPhone: {
      type: String,
      required: [true, 'Passenger phone number is required'],
      trim: true
    },
    passengerEmail: {
      type: String,
      required: [true, 'Passenger email is required'],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    numberOfSeats: {
      type: Number,
      required: [true, 'Number of seats is required'],
      min: [1, 'Number of seats must be at least 1']
    },
    farePerSeat: {
      type: Number,
      required: [true, 'Fare per seat is required'],
      min: [0.01, 'Fare per seat must be greater than zero']
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0.01, 'Total amount must be greater than zero']
    },
    bookingStatus: {
      type: String,
      enum: {
        values: Object.values(BookingStatus),
        message: 'Invalid booking status: {VALUE}'
      },
      required: [true, 'Booking status is required'],
      default: BookingStatus.PENDING
    },
    paymentStatus: {
      type: String,
      enum: {
        values: Object.values(PaymentStatus),
        message: 'Invalid payment status: {VALUE}'
      },
      required: [true, 'Payment status is required'],
      default: PaymentStatus.UNPAID
    },
    bookingExpiresAt: {
      type: Date,
      required: [true, 'Booking expiration date is required']
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
    collection: 'bookings'
  }
);

// Partial unique index on bookingCode to allow duplicates only for soft-deleted bookings
bookingSchema.index(
  { bookingCode: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
