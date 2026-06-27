/**
 * @file Ticket.js
 * @description Mongoose Schema and Model definition for the Ticket domain.
 */

const mongoose = require('mongoose');
const TicketStatus = require('../../../constants/ticketStatus');

const ticketSchema = new mongoose.Schema(
  {
    ticketCode: {
      type: String,
      required: [true, 'Ticket code is required'],
      trim: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required']
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: [true, 'Payment ID is required']
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
        message: 'A ticket must have at least one seat ID'
      }
    },
    qrPayload: {
      type: String,
      required: [true, 'QR payload is required']
    },
    qrHash: {
      type: String,
      required: [true, 'QR hash is required']
    },
    ticketStatus: {
      type: String,
      enum: {
        values: Object.values(TicketStatus),
        message: 'Invalid ticket status: {VALUE}'
      },
      required: [true, 'Ticket status is required'],
      default: TicketStatus.ACTIVE
    },
    issuedAt: {
      type: Date,
      required: [true, 'Issued date is required']
    },
    validatedAt: {
      type: Date,
      default: null
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    boardingLocation: {
      type: String,
      default: null
    },
    validatedFrom: {
      type: String,
      default: null
    },
    deviceId: {
      type: String,
      default: null
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
    collection: 'tickets'
  }
);

// Partial unique index on ticketCode to allow duplicates only for soft-deleted tickets
ticketSchema.index(
  { ticketCode: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

// Partial unique index on bookingId to enforce that only one ticket can exist for each booking
ticketSchema.index(
  { bookingId: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
