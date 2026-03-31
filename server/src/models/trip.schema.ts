import mongoose, { Document, Schema, Model } from 'mongoose';

type TripStatus = 'draft' | 'dispatched' | 'completed' | 'cancelled';

interface ITrip extends Document {
  company: mongoose.Types.ObjectId;
  vehicle: mongoose.Types.ObjectId;
  driver: mongoose.Types.ObjectId;
  cargoWeight: number;
  startLocation?: string;
  endLocation?: string;
  revenue: number;
  status: TripStatus;
  startOdometer?: number;
  endOdometer?: number;
  createdAt: Date;
  updatedAt: Date;
}

const tripSchema = new Schema<ITrip>(
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
    driver: {
      type: Schema.Types.ObjectId,
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

const Trip: Model<ITrip> = mongoose.model('Trip', tripSchema);
export { Trip, ITrip, TripStatus };
export default Trip;
