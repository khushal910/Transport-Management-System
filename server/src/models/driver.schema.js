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
  },
  { timestamps: true }
);

const Driver = mongoose.model('Driver', driverSchema);
export default Driver;
