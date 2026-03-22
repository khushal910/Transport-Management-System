import mongoose from 'mongoose';

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
      enum: ['on_duty', 'off_duty', 'on_trip', 'suspended'],
      default: 'off_duty',
    },
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
