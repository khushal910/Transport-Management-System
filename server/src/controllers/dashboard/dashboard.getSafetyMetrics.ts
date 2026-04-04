// @ts-nocheck
import mongoose from 'mongoose';
import Driver from '../../models/driver.schema';
import Vehicle from '../../models/vehicle.schema';
import Trip from '../../models/trip.schema';
import response from '../../response/response';

const getSafetyMetrics = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return response(res, 401, false, 'Company ID is required');
    }

    const companyObjectId = new mongoose.Types.ObjectId(companyId);

    // Fetch all safety-related data in parallel
    const [drivers, vehicles, tripsWithAccidents] = await Promise.all([
      Driver.find({ company: companyObjectId, isDeleted: false })
        .select('licenseExpiry safetyScore user')
        .populate({
          path: 'user',
          select: 'name',
        })
        .exec(),
      Vehicle.find({ company: companyObjectId, isDeleted: false }).exec(),
      Trip.find({ company: companyObjectId }).exec(),
    ]);

    // Get current date for calculations
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Calculate expired licenses
    const expiredLicenses = drivers.filter((driver) => {
      const licenseExpiry = new Date(driver.licenseExpiry);
      licenseExpiry.setHours(0, 0, 0, 0);
      return licenseExpiry < now;
    }).length;

    // Calculate low safety scores (< 70)
    const lowSafetyScores = drivers.filter((driver) => {
      const score = driver.safetyScore || 100;
      return score < 70;
    }).length;

    // Calculate high risk drivers (< 60)
    const highRiskDrivers = drivers.filter((driver) => {
      const score = driver.safetyScore || 100;
      return score < 60;
    }).length;

    // Calculate recent accidents (trips with hasAccident in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAccidents = tripsWithAccidents.filter((trip) => {
      const tripDate = new Date(trip.updatedAt);
      return trip.hasAccident === true && tripDate >= thirtyDaysAgo;
    }).length;

    // Calculate maintenance alerts (vehicles in 'in_shop' status)
    const maintenanceAlerts = vehicles.filter((v) => v.status === 'in_shop').length;

    const safetyMetrics = {
      expiredLicenses,
      lowSafetyScores,
      highRiskDrivers,
      recentAccidents,
      maintenanceAlerts,
    };

    return response(res, 200, true, 'Safety metrics fetched successfully', safetyMetrics);
  } catch (error) {
    console.error('Error fetching safety metrics:', error);
    return response(res, 500, false, 'Error fetching safety metrics', error.message);
  }
};

export default getSafetyMetrics;
