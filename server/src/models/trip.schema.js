import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    cargoWeight: {
      type: Number,
      required: true,
    },
    startLocation: String,
    endLocation: String,
    revenue: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'dispatched', 'completed', 'cancelled'],
      default: 'draft',
    },
    startOdometer: Number,
    endOdometer: Number,
  },
  { timestamps: true }
);

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
