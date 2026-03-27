import mongoose from 'mongoose';
import { DRIVER_STATUS } from '../constants/driverStatus.constants.js';

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    licenseExpiry: {
      type: Date,
      required: true,
    },
    licenseCategory: {
      type: String,
      enum: ['truck', 'van', 'bike'],
      required: true,
    },
    safetyScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: [DRIVER_STATUS.AVAILABLE, DRIVER_STATUS.ON_TRIP, DRIVER_STATUS.OFF_DUTY, DRIVER_STATUS.SUSPENDED],
      default: DRIVER_STATUS.OFF_DUTY,
    },
    lastStatusChange: {
      type: Date,
      default: Date.now,
    },
    statusHistory: [
      {
        fromStatus: {
          type: String,
          enum: [DRIVER_STATUS.AVAILABLE, DRIVER_STATUS.ON_TRIP, DRIVER_STATUS.OFF_DUTY, DRIVER_STATUS.SUSPENDED],
        },
        toStatus: {
          type: String,
          enum: [DRIVER_STATUS.AVAILABLE, DRIVER_STATUS.ON_TRIP, DRIVER_STATUS.OFF_DUTY, DRIVER_STATUS.SUSPENDED],
        },
        reason: {
          type: String,
          enum: ['manual_update', 'automatic_trip_assign', 'automatic_trip_complete', 'automatic_trip_cancel'],
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null, // null for automatic changes
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    complaints: {
      type: Number,
      default: 0,
      min: 0,
    },
    assignedTrips: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedTrips: {
      type: Number,
      default: 0,
      min: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

const Driver = mongoose.model('Driver', driverSchema);
export default Driver;
