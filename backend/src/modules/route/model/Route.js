/**
 * @file Route.js
 * @description Mongoose Schema and Model definition for the Route domain.
 */

const mongoose = require('mongoose');
const RouteTypes = require('../../../constants/routeTypes');
const RouteStatus = require('../../../constants/routeStatus');

const stopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Stop name is required'],
      trim: true
    },
    order: {
      type: Number,
      required: [true, 'Stop order is required'],
      min: [1, 'Stop order must be at least 1']
    },
    distanceFromOrigin: {
      type: Number,
      required: [true, 'Distance from origin is required'],
      min: [0, 'Distance from origin cannot be negative']
    },
    estimatedArrivalOffset: {
      type: Number,
      required: [true, 'Estimated arrival offset is required'],
      min: [0, 'Estimated arrival offset cannot be negative']
    }
  },
  { _id: false } // Exclude _id generation for nested stops to keep subdocuments lightweight
);

const routeSchema = new mongoose.Schema(
  {
    routeCode: {
      type: String,
      required: [true, 'Route code is required'],
      trim: true
    },
    routeName: {
      type: String,
      required: [true, 'Route name is required'],
      trim: true
    },
    origin: {
      type: String,
      required: [true, 'Origin is required'],
      trim: true
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true
    },
    type: {
      type: String,
      enum: {
        values: Object.values(RouteTypes),
        message: 'Invalid route type: {VALUE}'
      },
      required: [true, 'Route type is required'],
      default: RouteTypes.NORMAL
    },
    color: {
      type: String,
      default: null // Supporting Hex value color codes, e.g. '#1976D2'
    },
    stops: {
      type: [stopSchema],
      default: []
    },
    distance: {
      type: Number,
      required: [true, 'Distance is required'],
      min: [0.01, 'Distance must be greater than 0']
    },
    estimatedDuration: {
      type: Number,
      required: [true, 'Estimated duration is required'],
      min: [1, 'Estimated duration must be greater than 0']
    },
    baseFare: {
      type: Number,
      required: [true, 'Base fare is required'],
      min: [0.01, 'Base fare must be greater than 0']
    },
    farePerKm: {
      type: Number,
      required: [true, 'Fare per km is required'],
      min: [0.01, 'Fare per km must be greater than 0']
    },
    status: {
      type: String,
      enum: {
        values: Object.values(RouteStatus),
        message: 'Invalid status: {VALUE}'
      },
      required: [true, 'Status is required'],
      default: RouteStatus.ACTIVE
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
    collection: 'routes'
  }
);

// Partial unique index on routeCode to allow duplicates only for soft-deleted routes
routeSchema.index(
  { routeCode: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

const Route = mongoose.model('Route', routeSchema);

module.exports = Route;
