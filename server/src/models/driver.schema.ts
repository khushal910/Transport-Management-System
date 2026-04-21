import mongoose, { Document, Schema, Model } from 'mongoose';
import { DRIVER_STATUS, DriverStatus } from '../constants/driverStatus.constants';

type LicenseCategory = 'truck' | 'van' | 'bike';
type DriverStatusChangeReason =
  | 'manual_update'
  | 'automatic_trip_assign'
  | 'automatic_trip_complete'
  | 'automatic_trip_cancel';

interface IDriverStatusHistory {
  fromStatus?: DriverStatus;
  toStatus: DriverStatus;
  reason: DriverStatusChangeReason;
  changedBy: mongoose.Types.ObjectId | null;
  changedAt: Date;
}

interface IDriver extends Document {
  user: mongoose.Types.ObjectId;
  licenseNumber: string;
  licenseExpiry: Date;
  licenseCategory: LicenseCategory;
  safetyScore: number;
  status: DriverStatus;
  lastStatusChange: Date;
  statusHistory: IDriverStatusHistory[];
  complaints: number;
  assignedTrips: number;
  completedTrips: number;
  completionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const driverSchema = new Schema<IDriver>(
  {
    user: {
      type: Schema.Types.ObjectId,
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
      enum: Object.values(DriverStatus),
      default: DRIVER_STATUS.OFF_DUTY,
    } as any,
    lastStatusChange: {
      type: Date,
      default: Date.now,
    },
    statusHistory: [
      {
        fromStatus: {
          type: String,
          enum: Object.values(DriverStatus),
        },
        toStatus: {
          type: String,
          enum: Object.values(DriverStatus),
        },
        reason: {
          type: String,
          enum: [
            'manual_update',
            'automatic_trip_assign',
            'automatic_trip_complete',
            'automatic_trip_cancel',
          ],
        },
        changedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          default: null,
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

const Driver = mongoose.model<IDriver>('Driver', driverSchema);
export { Driver, IDriver, LicenseCategory, DriverStatusChangeReason, IDriverStatusHistory };
export default Driver;
