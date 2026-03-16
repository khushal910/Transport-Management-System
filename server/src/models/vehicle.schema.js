import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
  },
  { timestamps: true }
);

// TEXT INDEX
vehicleSchema.index({
  name: "text",
  model: "text",
  licensePlate: "text",
  vehicleType: "text",
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
