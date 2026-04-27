import mongoose, { Document, Schema, Model } from 'mongoose';

type TripStatus = 'draft' | 'dispatched' | 'completed' | 'cancelled';

interface ITripLocationDetails {
  placeId: string;
  displayName: string;
  latitude: number;
  longitude: number;
  source?: string;
}

interface ITrip extends Document {
  company: mongoose.Types.ObjectId;
  vehicle: mongoose.Types.ObjectId;
  driver: mongoose.Types.ObjectId;
  cargoWeight: number;
  startLocation?: string;
  endLocation?: string;
  startLocationDetails?: ITripLocationDetails;
  endLocationDetails?: ITripLocationDetails;
  revenue: number;
  status: TripStatus;
  startOdometer?: number;
  endOdometer?: number;
  createdAt: Date;
  updatedAt: Date;
}

const locationDetailsSchema = new Schema<ITripLocationDetails>(
  {
    placeId: {
      type: String,
      required: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      default: 'nominatim',
    },
  },
  { _id: false },
);

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
    startLocation: {
      type: String,
      trim: true,
    },
    endLocation: {
      type: String,
      trim: true,
    },
    startLocationDetails: {
      type: locationDetailsSchema,
      required: false,
    },
    endLocationDetails: {
      type: locationDetailsSchema,
      required: false,
    },
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
export { Trip, ITrip, TripStatus, ITripLocationDetails };
export default Trip;
