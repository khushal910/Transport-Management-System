// @ts-nocheck
import mongoose from 'mongoose';
import Trip from '../../models/trip.schema';
import Vehicle from '../../models/vehicle.schema';
import Driver from '../../models/driver.schema';
import response from '../../response/response';
import dashboardQuerySchema from '../../validations/dashboard.validator';

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

    // If status filter is applied, use it; otherwise show draft and dispatched (active) trips
    if (value.status) {
      tripsQuery.status = value.status.toLowerCase();
    } else {
      tripsQuery.status = { $in: ['draft', 'dispatched'] };
    }

    const [vehicles, trips, maintenancePendingCount] = await Promise.all([
      Vehicle.find({ company: companyObjectId, isDeleted: false }).exec(),
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

    // Count pending cargo (trips in draft or dispatched status)
    const pendingCargoCount = await Trip.countDocuments({
      company: companyObjectId,
      status: { $in: ['draft', 'dispatched'] },
    });

    // Calculate completed today (trips completed today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const completedTodayCount = await Trip.countDocuments({
      company: companyObjectId,
      status: 'completed',
      updatedAt: { $gte: today, $lt: tomorrow },
    });

    // Calculate pending assignment (trips in draft status - not yet assigned to vehicle/driver)
    const pendingAssignmentCount = await Trip.countDocuments({
      company: companyObjectId,
      status: 'draft',
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
        pendingCargo: pendingCargoCount,
        completedToday: completedTodayCount,
        pendingAssignment: pendingAssignmentCount,
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

