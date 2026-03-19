import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    cost: {
      type: Number,
      default: 0,
    },
    distance: {
      type: Number,
      default: 0,
      min: 0,
    },
    serviceDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceSchema);
export default MaintenanceLog;
