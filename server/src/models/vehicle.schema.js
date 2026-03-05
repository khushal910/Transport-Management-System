import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    licensePlate: {
      type: String,
      required: true,
      unique: true,
    },
    model: {
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
  },
  { timestamps: true }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
