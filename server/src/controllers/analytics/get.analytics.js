import mongoose from 'mongoose';
import Trip from '../../models/trip.schema.js';
import Vehicle from '../../models/vehicle.schema.js';
import FuelLog from '../../models/fuel.schema.js';
import MaintenanceLog from '../../models/maintenance.schema.js';
import response from '../../response/response.js';
import analyticsQuerySchema from '../../validations/analytics.validator.js';
import calculateFuelEfficiency from './calculateFuelEfficiency.js';
import calculateVehicleROI from './calculateVehicleROI.js';
import calculateUtilizationRate from './calculateUtilizationRate.js';
import calculateMonthlyFinancial from './calculateMonthlyFinancial.js';
import calculateFleetKPIs from './calculateFleetKPIs.js';
import getTopCostliestVehicles from './getTopCostliestVehicles.js';
import getDeadStock from './getDeadStock.js';

const getAnalytics = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return response(res, 401, false, 'Company ID is required');
    }

    const { error, value } = analyticsQuerySchema.validate(req.query);

    if (error) {
      const errors = error.details.map((detail) =>
        detail.message.replace(/"/g, '')
      );
      return response(res, 400, false, 'Validation failed', errors);
    }

    // Set date range (default: last 12 months)
    const endDate = value.endDate ? new Date(value.endDate) : new Date();
    const startDate = value.startDate
      ? new Date(value.startDate)
      : new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);

    const companyObjectId = new mongoose.Types.ObjectId(companyId);

    // Fetch all required data
    const [trips, fuelLogs, maintenanceLogs, vehicles] = await Promise.all([
      Trip.find({
        company: companyObjectId,
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed',
      })
        .populate('vehicle')
        .populate('driver')
        .exec(),
      FuelLog.find({
        company: companyObjectId,
        date: { $gte: startDate, $lte: endDate },
        status: 'completed',
      }).exec(),
      MaintenanceLog.find({
        company: companyObjectId,
        serviceDate: { $gte: startDate, $lte: endDate },
        status: 'completed',
      }).exec(),
      Vehicle.find({ company: companyObjectId }).exec(),
    ]);

    const analyticsData = {};

    // Calculate all metrics using modular functions
    const fuelEfficiency = calculateFuelEfficiency(fuelLogs, vehicles);
    const vehicleROI = calculateVehicleROI(trips, fuelLogs, maintenanceLogs);
    const utilizationRate = calculateUtilizationRate(trips, vehicles);
    const deadStock = getDeadStock(utilizationRate);
    const monthlyFinancial = calculateMonthlyFinancial(
      trips,
      fuelLogs,
      maintenanceLogs
    );
    const topCostliestVehicles = getTopCostliestVehicles(vehicleROI, 5);
    const fleetKPIs = calculateFleetKPIs(
      trips,
      fuelLogs,
      maintenanceLogs,
      vehicles,
      utilizationRate,
      deadStock
    );

    // Assemble analytics data
    analyticsData.fuelEfficiency = fuelEfficiency;
    analyticsData.vehicleROI = vehicleROI;
    analyticsData.utilizationRate = utilizationRate;
    analyticsData.deadStock = deadStock;
    analyticsData.monthlyFinancial = monthlyFinancial;
    analyticsData.topCostliestVehicles = topCostliestVehicles;
    analyticsData.fleetKPIs = fleetKPIs;

    return response(
      res,
      200,
      true,
      'Analytics data fetched successfully',
      analyticsData
    );
  } catch (err) {
    console.error('Analytics error:', err.message);
    return response(res, 500, false, 'Failed to fetch analytics data');
  }
};

export default getAnalytics;
