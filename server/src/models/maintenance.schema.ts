import mongoose, { Document, Schema, Model } from 'mongoose';

type MaintenanceStatus = 'pending' | 'completed' | 'cancelled';

interface IMaintenance extends Document {
  company: mongoose.Types.ObjectId;
  vehicle: mongoose.Types.ObjectId;
  description: string;
  cost: number;
  distance: number;
  serviceDate: Date;
  status: MaintenanceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const maintenanceSchema = new Schema<IMaintenance>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    vehicle: {
      type: Schema.Types.ObjectId,
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

const MaintenanceLog: Model<IMaintenance> = mongoose.model('MaintenanceLog', maintenanceSchema);
export { MaintenanceLog, IMaintenance, MaintenanceStatus };
export default MaintenanceLog;
