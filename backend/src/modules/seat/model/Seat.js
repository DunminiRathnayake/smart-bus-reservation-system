/**
 * @file Seat.js
 * @description Mongoose Schema and Model definition for the Seat domain.
 */

const mongoose = require('mongoose');
const SeatType = require('../../../constants/seatType');
const SeatStatus = require('../../../constants/seatStatus');

const seatSchema = new mongoose.Schema(
  {
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      required: [true, 'Schedule ID is required']
    },
    seatNumber: {
      type: String,
      required: [true, 'Seat number is required'],
      trim: true
    },
    row: {
      type: String,
      required: [true, 'Row is required']
    },
    column: {
      type: String,
      required: [true, 'Column is required']
    },
    deck: {
      type: Number,
      required: [true, 'Deck number is required'],
      default: 1
    },
    seatType: {
      type: String,
      enum: {
        values: Object.values(SeatType),
        message: 'Invalid seat type: {VALUE}'
      },
      required: [true, 'Seat type is required']
    },
    status: {
      type: String,
      enum: {
        values: Object.values(SeatStatus),
        message: 'Invalid seat status: {VALUE}'
      },
      required: [true, 'Seat status is required'],
      default: SeatStatus.AVAILABLE
    },
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'seats'
  }
);

// Compound unique index to ensure seat numbers are unique within a schedule
seatSchema.index(
  { scheduleId: 1, seatNumber: 1 },
  { unique: true }
);

const Seat = mongoose.model('Seat', seatSchema);

module.exports = Seat;
