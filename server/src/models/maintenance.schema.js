import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    description: String,
    cost: Number,
    serviceDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceSchema);
export default MaintenanceLog;
