/**
 * @file Payment.js
 * @description Mongoose Schema and Model definition for the Payment domain.
 */

const mongoose = require('mongoose');
const PaymentTransactionStatus = require('../../../constants/paymentTransactionStatus');
const PaymentMethod = require('../../../constants/paymentMethod');
const PaymentGateway = require('../../../constants/paymentGateway');

const paymentSchema = new mongoose.Schema(
  {
    paymentCode: {
      type: String,
      required: [true, 'Payment code is required'],
      trim: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero']
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'LKR'
    },
    paymentMethod: {
      type: String,
      enum: {
        values: Object.values(PaymentMethod),
        message: 'Invalid payment method: {VALUE}'
      },
      required: [true, 'Payment method is required']
    },
    gateway: {
      type: String,
      enum: {
        values: Object.values(PaymentGateway),
        message: 'Invalid payment gateway: {VALUE}'
      },
      required: [true, 'Payment gateway is required'],
      default: PaymentGateway.SIMULATED
    },
    transactionReference: {
      type: String,
      default: null
    },
    paymentStatus: {
      type: String,
      enum: {
        values: Object.values(PaymentTransactionStatus),
        message: 'Invalid payment status: {VALUE}'
      },
      required: [true, 'Payment status is required'],
      default: PaymentTransactionStatus.PENDING
    },
    paidAt: {
      type: Date,
      default: null
    },
    failureReason: {
      type: String,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
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
    collection: 'payments'
  }
);

// Partial unique index on paymentCode to allow duplicates only for soft-deleted payments
paymentSchema.index(
  { paymentCode: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
