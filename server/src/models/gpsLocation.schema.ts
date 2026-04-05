import mongoose, { Document, Schema, Model } from 'mongoose';

interface IGPSLocation extends Document {
  trip: mongoose.Types.ObjectId;
  vehicle: mongoose.Types.ObjectId;
  driver: mongoose.Types.ObjectId;
  latitude: number;
  longitude: number;
  accuracy: number; // GPS accuracy in meters
  speed: number; // Speed in km/h (0 if stationary)
  heading: number; // Direction in degrees (0-360)
  altitude: number; // Altitude in meters
  timestamp: Date; // When GPS was recorded
  createdAt: Date;
  updatedAt: Date;
}

const gpsLocationSchema = new Schema<IGPSLocation>(
  {
    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
      index: true,
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    accuracy: {
      type: Number,
      default: 10, // meters
      min: 0,
    },
    speed: {
      type: Number,
      default: 0, // km/h
      min: 0,
    },
    heading: {
      type: Number,
      default: 0,
      min: 0,
      max: 360,
    },
    altitude: {
      type: Number,
      default: 0, // meters
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Index for querying active GPS locations by trip and time
gpsLocationSchema.index({ trip: 1, timestamp: -1 });
gpsLocationSchema.index({ vehicle: 1, timestamp: -1 });
gpsLocationSchema.index({ driver: 1, timestamp: -1 });

// TTL Index: Auto-delete GPS records older than 7 days
gpsLocationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 }); // 7 days

const GPSLocation: Model<IGPSLocation> = mongoose.model(
  'GPSLocation',
  gpsLocationSchema
);

export { GPSLocation, IGPSLocation };
export default GPSLocation;
