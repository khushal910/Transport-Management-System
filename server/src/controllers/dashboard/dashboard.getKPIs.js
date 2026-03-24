import mongoose from 'mongoose';
import Trip from '../../models/trip.schema.js';
import Vehicle from '../../models/vehicle.schema.js';
import Driver from '../../models/driver.schema.js';
import response from '../../response/response.js';
import dashboardQuerySchema from '../../validations/dashboard.validator.js';

const getDashboardKPIs = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return response(res, 401, false, 'Company ID is required');
    }

    const { error, value } = dashboardQuerySchema.validate(req.query);

    if (error) {
      const errors = error.details.map((detail) =>
        detail.message.replace(/"/g, '')
      );
      return response(res, 400, false, 'Validation failed', errors);
    }

    const companyObjectId = new mongoose.Types.ObjectId(companyId);

    // Fetch all required data in parallel
    const tripsQuery = {
      company: companyObjectId,
    };

    // If status filter is applied, use it; otherwise show dispatched (active) trips
    if (value.status) {
      tripsQuery.status = value.status.toLowerCase();
    } else {
      tripsQuery.status = 'dispatched';
    }

    const [vehicles, trips, maintenancePendingCount] = await Promise.all([
      Vehicle.find({ company: companyObjectId }).exec(),
      Trip.find(tripsQuery)
        .populate({
          path: 'vehicle',
          select: 'licensePlate vehicleType model status',
        })
        .populate({
          path: 'driver',
          select: 'user',
          populate: {
            path: 'user',
            select: 'name email',
          },
        })
        .exec(),
      Vehicle.countDocuments({
        company: companyObjectId,
        status: 'in_shop',
      }),
    ]);

    // Calculate KPIs
    const activeFleetCount = vehicles.filter(
      (v) => v.status === 'on_trip' || v.status === 'available'
    ).length;

    const maintenanceAlertsCount = maintenancePendingCount;

    const utilizationRate = vehicles.length > 0
      ? Math.round(
          (vehicles.filter((v) => v.status === 'on_trip').length /
            vehicles.length) *
            100
        )
      : 0;

    // Count pending cargo (trips in draft or dispatched status)
    const pendingCargoCount = await Trip.countDocuments({
      company: companyObjectId,
      status: { $in: ['draft', 'dispatched'] },
    });

    // Build trips list with applied filters
    let filteredTrips = trips;

    // Only apply vehicleType filter here since status is already filtered in query
    if (value.vehicleType) {
      filteredTrips = filteredTrips.filter(
        (trip) =>
          trip.vehicle &&
          trip.vehicle.vehicleType === value.vehicleType.toLowerCase()
      );
    }

    // Transform trips data for response
    const tripsData = filteredTrips.map((trip) => ({
      tripId: trip._id,
      tripNumber: trip._id.toString().slice(-6).toUpperCase(),
      vehicle: {
        licensePlate: trip.vehicle?.licensePlate || 'N/A',
        vehicleType: trip.vehicle?.vehicleType || 'N/A',
        model: trip.vehicle?.model || 'N/A',
      },
      driver: {
        name: trip.driver?.user?.name || 'N/A',
        email: trip.driver?.user?.email || 'N/A',
      },
      status: trip.status,
      startOdometer: trip.startOdometer || 0,
      endOdometer: trip.endOdometer || 0,
      cargoWeight: trip.cargoWeight || 0,
      revenue: trip.revenue || 0,
    }));

    const dashboardData = {
      kpis: {
        activeFleet: activeFleetCount,
        maintenanceAlerts: maintenanceAlertsCount,
        utilizationRate: utilizationRate,
        pendingCargo: pendingCargoCount,
      },
      trips: tripsData,
    };

    return response(res, 200, true, 'Dashboard data fetched successfully', dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard KPIs:', error);
    return response(res, 500, false, 'Error fetching dashboard data', error.message);
  }
};

export default getDashboardKPIs;
