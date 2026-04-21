import mongoose, { Document, Schema, Model } from 'mongoose';

type VehicleType = 'truck' | 'van' | 'bike';
type VehicleStatus = 'available' | 'on_trip' | 'in_shop' | 'retired';

interface IVehicle extends Document {
  company: mongoose.Types.ObjectId;
  name: string;
  licensePlate: string;
  vehicleModel: string;
  vehicleType: VehicleType;
  maxCapacity: number;
  odometer: number;
  status: VehicleStatus;
  isDeleted: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    licensePlate: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleModel: {
      type: String,
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ['truck', 'van', 'bike'],
      required: true,
    },
    maxCapacity: {
      type: Number,
      required: true,
    },
    odometer: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['available', 'on_trip', 'in_shop', 'retired'],
      default: 'available',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
  },
  { timestamps: true }
);

// TEXT INDEX + SOFT DELETE
vehicleSchema.index({
  name: "text",
  model: "text",
  licensePlate: "text",
  vehicleType: "text",
  isDeleted: 1,
});

const Vehicle: Model<IVehicle> = mongoose.model('Vehicle', vehicleSchema);
export { Vehicle, IVehicle, VehicleType, VehicleStatus };
export default Vehicle;
