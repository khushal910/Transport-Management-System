import mongoose, { Document, Schema, Model } from 'mongoose';

type FuelLogStatus = 'pending' | 'completed' | 'cancelled';

interface IFuelLog extends Document {
  company: mongoose.Types.ObjectId;
  trip: mongoose.Types.ObjectId;
  driver: mongoose.Types.ObjectId;
  vehicle: mongoose.Types.ObjectId;
  fuelCost: number;
  miscExpense: number;
  distance: number;
  status: FuelLogStatus;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const fuelLogSchema = new Schema<IFuelLog>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    fuelCost: {
      type: Number,
      required: true,
      min: 0,
    },
    miscExpense: {
      type: Number,
      default: 0,
      min: 0,
    },
    distance: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const FuelLog: Model<IFuelLog> = mongoose.model('FuelLog', fuelLogSchema);
export { FuelLog, IFuelLog, FuelLogStatus };
export default FuelLog;
