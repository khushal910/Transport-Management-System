import Trip from '../../models/trip.schema.js';
import FuelLog from '../../models/fuel.schema.js';
import response from '../../response/response.js';
import { expenseCreateSchema } from '../../validations/expense.create.validator.js';

export const createExpense = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = expenseCreateSchema.validate(req.body, { abortEarly: true });
    if (error) {
      return response(res, 400, false, error.details[0]?.message || 'Validation failed');
    }

    const { tripId, fuelCost, miscExpense, distance } = value;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return response(res, 401, false, 'Company not found in token');
    }

    // Find the trip
    const trip = await Trip.findById(tripId)
      .populate('driver', '_id')
      .populate('vehicle', '_id');

    if (!trip) {
      return response(res, 404, false, 'Trip not found');
    }

    // Use provided distance or calculate from odometer if available
    let calculatedDistance = distance || 0;
    if (!distance && trip.startOdometer && trip.endOdometer) {
      calculatedDistance = trip.endOdometer - trip.startOdometer;
    }

    // Create expense log
    const expenseLog = new FuelLog({
      company: companyId,
      trip: tripId,
      driver: trip.driver._id,
      vehicle: trip.vehicle._id,
      fuelCost: Number(fuelCost),
      miscExpense: Number(miscExpense) || 0,
      distance: calculatedDistance,
      status: 'pending',
      date: new Date(),
    });

    await expenseLog.save();

    return response(res, 201, true, 'Expense log created successfully', {
      expenseLog,
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    return response(res, 500, false, 'Error creating expense log');
  }
};
