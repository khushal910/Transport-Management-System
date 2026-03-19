import mongoose from 'mongoose';
import Trip from '../../models/trip.schema.js';
import Vehicle from '../../models/vehicle.schema.js';
import FuelLog from '../../models/fuel.schema.js';
import MaintenanceLog from '../../models/maintenance.schema.js';
import response from '../../response/response.js';
import analyticsQuerySchema from '../../validations/analytics.validator.js';

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

    // ==================== FUEL EFFICIENCY ====================
    const fuelEfficiencyMap = new Map();
    fuelLogs.forEach((log) => {
      if (!fuelEfficiencyMap.has(log.vehicle.toString())) {
        fuelEfficiencyMap.set(log.vehicle.toString(), {
          vehicleId: log.vehicle,
          totalDistance: 0,
          totalFuelCost: 0,
          fuelLogs: [],
        });
      }
      const data = fuelEfficiencyMap.get(log.vehicle.toString());
      data.totalDistance += log.distance || 0;
      data.totalFuelCost += log.fuelCost || 0;
      data.fuelLogs.push(log);
    });

    const fuelEfficiency = Array.from(fuelEfficiencyMap.values()).map(
      (data) => {
        const vehicle = vehicles.find(
          (v) => v._id.toString() === data.vehicleId.toString()
        );
        const kmPerLiter =
          data.totalFuelCost > 0
            ? (data.totalDistance / (data.totalFuelCost / 50)) * 100 // Assuming avg fuel price
            : 0;

        return {
          vehicleId: data.vehicleId,
          vehicleName: vehicle?.name || 'Unknown',
          licensePlate: vehicle?.licensePlate,
          totalDistance: data.totalDistance,
          totalFuelCost: data.totalFuelCost,
          kmPerLiter: Math.round(kmPerLiter * 100) / 100,
          efficiency:
            kmPerLiter > 5 ? 'Good' : kmPerLiter > 3 ? 'Average' : 'Poor',
        };
      }
    );

    analyticsData.fuelEfficiency = fuelEfficiency;

    // ==================== VEHICLE ROI ====================
    const roiMap = new Map();

    // Calculate revenue per vehicle
    trips.forEach((trip) => {
      const vehicleId = trip.vehicle._id.toString();
      if (!roiMap.has(vehicleId)) {
        roiMap.set(vehicleId, {
          vehicleId: trip.vehicle._id,
          vehicleName: trip.vehicle.name,
          licensePlate: trip.vehicle.licensePlate,
          revenue: 0,
          fuelCost: 0,
          maintenanceCost: 0,
          trips: 0,
        });
      }
      const data = roiMap.get(vehicleId);
      data.revenue += trip.revenue || 0;
      data.trips += 1;
    });

    // Add fuel costs
    fuelLogs.forEach((log) => {
      const vehicleId = log.vehicle.toString();
      if (roiMap.has(vehicleId)) {
        roiMap.get(vehicleId).fuelCost += log.fuelCost || 0;
      }
    });

    // Add maintenance costs
    maintenanceLogs.forEach((log) => {
      const vehicleId = log.vehicle.toString();
      if (roiMap.has(vehicleId)) {
        roiMap.get(vehicleId).maintenanceCost += log.cost || 0;
      }
    });

    const vehicleROI = Array.from(roiMap.values()).map((data) => {
      const totalExpense = data.fuelCost + data.maintenanceCost;
      const roi = data.revenue - totalExpense;
      const roiPercentage =
        totalExpense > 0 ? ((roi / totalExpense) * 100).toFixed(2) : 0;

      return {
        vehicleId: data.vehicleId,
        vehicleName: data.vehicleName,
        licensePlate: data.licensePlate,
        revenue: data.revenue,
        fuelCost: data.fuelCost,
        maintenanceCost: data.maintenanceCost,
        totalExpense,
        netProfit: roi,
        roiPercentage: parseFloat(roiPercentage),
        trips: data.trips,
      };
    });

    analyticsData.vehicleROI = vehicleROI;

    // ==================== UTILIZATION RATE ====================
    const utilizationMap = new Map();

    vehicles.forEach((vehicle) => {
      const vehicleId = vehicle._id.toString();
      const vehicleTrips = trips.filter(
        (t) => t.vehicle._id.toString() === vehicleId
      );

      utilizationMap.set(vehicleId, {
        vehicleId: vehicle._id,
        vehicleName: vehicle.name,
        licensePlate: vehicle.licensePlate,
        totalTrips: vehicleTrips.length,
        averageDistance:
          vehicleTrips.length > 0
            ? vehicleTrips.reduce(
                (sum, t) => sum + (t.endOdometer - t.startOdometer || 0),
                0
              ) / vehicleTrips.length
            : 0,
        status: vehicle.status,
      });
    });

    const utilizationRate = Array.from(utilizationMap.values()).map((data) => {
      const utilizationPercent =
        data.totalTrips > 0 ? Math.min((data.totalTrips / 30) * 100, 100) : 0; // Assuming 30 trips is 100% util

      return {
        ...data,
        utilizationPercent: Math.round(utilizationPercent),
        isDeadStock: data.totalTrips === 0,
      };
    });

    analyticsData.utilizationRate = utilizationRate;

    // ==================== DEAD STOCK (Idle Vehicles) ====================
    analyticsData.deadStock = utilizationRate.filter((v) => v.isDeadStock);

    // ==================== TOP COSTLIEST VEHICLES ====================
    const topCostliest = vehicleROI
      .sort((a, b) => b.totalExpense - a.totalExpense)
      .slice(0, 5);

    analyticsData.topCostliestVehicles = topCostliest;

    // ==================== MONTHLY FINANCIAL SUMMARY ====================
    const monthlyData = new Map();

    trips.forEach((trip) => {
      const date = new Date(trip.createdAt);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthKey,
          revenue: 0,
          fuelCost: 0,
          maintenanceCost: 0,
          netProfit: 0,
        });
      }

      monthlyData.get(monthKey).revenue += trip.revenue || 0;
    });

    fuelLogs.forEach((log) => {
      const date = new Date(log.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;

      if (monthlyData.has(monthKey)) {
        monthlyData.get(monthKey).fuelCost += log.fuelCost || 0;
      }
    });

    maintenanceLogs.forEach((log) => {
      const date = new Date(log.serviceDate);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;

      if (monthlyData.has(monthKey)) {
        monthlyData.get(monthKey).maintenanceCost += log.cost || 0;
      }
    });

    const monthlyFinancial = Array.from(monthlyData.values())
      .map((data) => ({
        ...data,
        netProfit: data.revenue - data.fuelCost - data.maintenanceCost,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    analyticsData.monthlyFinancial = monthlyFinancial;

    // ==================== FLEET KPIs ====================
    const totalRevenue = trips.reduce((sum, t) => sum + (t.revenue || 0), 0);
    const totalFuelCost = fuelLogs.reduce(
      (sum, f) => sum + (f.fuelCost || 0),
      0
    );
    const totalMaintenanceCost = maintenanceLogs.reduce(
      (sum, m) => sum + (m.cost || 0),
      0
    );
    const totalExpense = totalFuelCost + totalMaintenanceCost;
    const totalNetProfit = totalRevenue - totalExpense;
    const fleetROI =
      totalExpense > 0
        ? (((totalRevenue - totalExpense) / totalExpense) * 100).toFixed(2)
        : 0;
    const avgUtilization =
      utilizationRate.length > 0
        ? Math.round(
            utilizationRate.reduce((sum, v) => sum + v.utilizationPercent, 0) /
              utilizationRate.length
          )
        : 0;

    analyticsData.fleetKPIs = {
      totalTrips: trips.length,
      totalRevenue,
      totalFuelCost,
      totalMaintenanceCost,
      totalExpense,
      totalNetProfit,
      fleetROI: parseFloat(fleetROI),
      averageUtilization: avgUtilization,
      activeVehicles: vehicles.filter((v) => v.status !== 'retired').length,
      totalVehicles: vehicles.length,
      deadStockVehicles: analyticsData.deadStock.length,
    };

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
