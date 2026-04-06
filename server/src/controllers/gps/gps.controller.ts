import mongoose from 'mongoose';
import GPSLocation from '../../models/gpsLocation.schema';
import { Trip } from '../../models/trip.schema';
import Vehicle from '../../models/vehicle.schema';
import Driver from '../../models/driver.schema';
import response from '../../response/response';
import {
  getLatestTripLocation,
  getTripGPSHistory,
  getActiveTripsWithGPS,
} from '../../services/gpsSimulator';

/**
 * Get active trips list for current user
 * RBAC: All authenticated users can view active trips for their company
 */
export const getActiveTrips = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { userRole, companyId } = req.user;
    const userId = (req.user as any)?.userId || (req.user as any)?.id;
    const { search } = req.query;

    // Get all dispatched/active trips for the company
    let trips = await Trip.find({
      company: companyId,
      status: 'dispatched', // Only active trips
    })
      .populate('vehicle driver')
      .sort({ createdAt: -1 })
      .limit(100);

    // Filter by role - drivers can only see their own trips
    if (userRole === 'driver') {
      if (!userId) {
        trips = [];
      } else {
        const driverData = await Driver.findOne({ user: userId });
        trips = trips.filter(
          (trip) => trip.driver._id.toString() === driverData?._id.toString()
        );
      }
    }

    // Apply search filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      trips = trips.filter((trip) => {
        const vehicleName =
          trip.vehicle?.name?.toLowerCase() || '';
        const driverName =
          trip.driver?.user?.email?.toLowerCase() || '';
        const tripStart = trip.startLocation?.toLowerCase() || '';
        const tripEnd = trip.endLocation?.toLowerCase() || '';

        return (
          vehicleName.includes(lowerSearch) ||
          driverName.includes(lowerSearch) ||
          tripStart.includes(lowerSearch) ||
          tripEnd.includes(lowerSearch)
        );
      });
    }

    return response(res, 200, true, 'Active trips retrieved successfully', {
      trips: trips.map((trip) => ({
        _id: trip._id,
        vehicleName: trip.vehicle?.name,
        licensePlate: trip.vehicle?.licensePlate,
        driverName: trip.driver?.user?.email,
        startLocation: trip.startLocation,
        endLocation: trip.endLocation,
        cargoWeight: trip.cargoWeight,
        status: trip.status,
        createdAt: trip.createdAt,
      })),
      total: trips.length,
    });
  } catch (error: any) {
    console.error('Error in getActiveTrips:', error);
    return response(res, 500, false, error.message || 'Failed to retrieve active trips');
  }
};

/**
 * Get latest GPS location for a specific trip
 * RBAC: User must have access to the trip
 */
export const getTripLatestLocation = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { tripId } = req.params;
    const { userRole, companyId } = req.user;
    const userId = (req.user as any)?.userId || (req.user as any)?.id;

    if (!mongoose.isValidObjectId(tripId)) {
      return response(res, 400, false, 'Invalid trip ID format');
    }

    // Validate trip exists and belongs to user's company
    const trip = await Trip.findOne({
      _id: tripId,
      company: companyId,
    }).populate('driver');

    if (!trip) {
      return response(res, 404, false, 'Trip not found or access denied');
    }

    // Driver can only view their own trip
    if (userRole === 'driver') {
      if (!userId) {
        return response(res, 401, false, 'Unauthorized: Driver identity missing');
      }
      const driverData = await Driver.findOne({ user: userId });
      if (!driverData || trip.driver._id.toString() !== driverData._id.toString()) {
        return response(res, 403, false, 'You can only view your own trip GPS');
      }
    }

    // Get latest GPS location
    const latestLocation = await getLatestTripLocation(tripId);

    if (!latestLocation) {
      return response(res, 404, false, 'No GPS data available for this trip yet');
    }

    return response(res, 200, true, 'Latest GPS location retrieved', {
      location: {
        latitude: latestLocation.latitude,
        longitude: latestLocation.longitude,
        speed: latestLocation.speed,
        heading: latestLocation.heading,
        accuracy: latestLocation.accuracy,
        altitude: latestLocation.altitude,
        timestamp: latestLocation.timestamp,
      },
      vehicle: {
        name: trip.vehicle?.name,
        licensePlate: trip.vehicle?.licensePlate,
      },
      driver: {
        email: trip.driver?.user?.email,
      },
      route: {
        startLocation: trip.startLocation,
        endLocation: trip.endLocation,
      },
    });
  } catch (error: any) {
    console.error('Error in getTripLatestLocation:', error);
    return response(res, 500, false, error.message || 'Failed to retrieve trip location');
  }
};

/**
 * Get GPS history/trail for a trip
 * RBAC: User must have access to the trip
 */
export const getTripLocationHistory = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { tripId } = req.params;
    const { limit = 100 } = req.query;
    const { userRole, companyId } = req.user;
    const userId = (req.user as any)?.userId || (req.user as any)?.id;

    // Validate inputs
    if (!mongoose.isValidObjectId(tripId)) {
      return response(res, 400, false, 'Invalid trip ID format');
    }
    const parsedLimit = Math.min(parseInt(limit) || 100, 500); // Max 500 records

    // Validate trip exists and belongs to user's company
    const trip = await Trip.findOne({
      _id: tripId,
      company: companyId,
    }).populate('driver');

    if (!trip) {
      return response(res, 404, false, 'Trip not found or access denied');
    }

    // Driver can only view their own trip
    if (userRole === 'driver') {
      if (!userId) {
        return response(res, 401, false, 'Unauthorized: Driver identity missing');
      }
      const driverData = await Driver.findOne({ user: userId });
      if (!driverData || trip.driver._id.toString() !== driverData._id.toString()) {
        return response(res, 403, false, 'You can only view your own trip GPS');
      }
    }

    // Get GPS history
    const history = await getTripGPSHistory(tripId, parsedLimit);

    if (!history.length) {
      return response(res, 404, false, 'No GPS data available for this trip');
    }

    return response(res, 200, true, `Retrieved ${history.length} GPS records`, {
      history: history.map((loc) => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
        speed: loc.speed,
        heading: loc.heading,
        accuracy: loc.accuracy,
        altitude: loc.altitude,
        timestamp: loc.timestamp,
      })),
      tripInfo: {
        vehicleName: trip.vehicle?.name,
        licensePlate: trip.vehicle?.licensePlate,
        driverEmail: trip.driver?.user?.email,
        startLocation: trip.startLocation,
        endLocation: trip.endLocation,
      },
      totalRecords: history.length,
    });
  } catch (error: any) {
    console.error('Error in getTripLocationHistory:', error);
    return response(res, 500, false, error.message || 'Failed to retrieve GPS history');
  }
};

/**
 * Get all active trips with their latest GPS data
 * RBAC: Shows only trips user has access to
 */
export const getAllActiveTripsGPS = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { userRole, companyId } = req.user;
    const userId = (req.user as any)?.userId || (req.user as any)?.id;

    // Get all active trips for company
    let trips = await Trip.find({
      company: companyId,
      status: 'dispatched',
    })
      .populate('vehicle driver')
      .lean()
      .limit(100);

    // Filter by role
    if (userRole === 'driver') {
      if (!userId) {
        trips = [];
      } else {
        const driverData = await Driver.findOne({ user: userId });
        trips = trips.filter(
          (trip) => trip.driver._id.toString() === driverData?._id.toString()
        );
      }
    }

    // Get latest GPS for each trip
    const tripsWithGPS = await Promise.all(
      trips.map(async (trip) => {
        const latestLocation = await getLatestTripLocation(trip._id.toString());
        return {
          tripId: trip._id,
          vehicleName: trip.vehicle?.name,
          licensePlate: trip.vehicle?.licensePlate,
          driverName: trip.driver?.user?.email,
          startLocation: trip.startLocation,
          endLocation: trip.endLocation,
          status: trip.status,
          gps: latestLocation
            ? {
                latitude: latestLocation.latitude,
                longitude: latestLocation.longitude,
                speed: latestLocation.speed,
                heading: latestLocation.heading,
                timestamp: latestLocation.timestamp,
              }
            : null,
        };
      })
    );

    return response(res, 200, true, 'Active trips GPS retrieved', {
      trips: tripsWithGPS,
      total: tripsWithGPS.length,
    });
  } catch (error: any) {
    console.error('Error in getAllActiveTripsGPS:', error);
    return response(res, 500, false, error.message || 'Failed to retrieve active trips GPS');
  }
};

export const shareDriverLocation = async (req: any, res: any): Promise<void> => {
  try {
    const { latitude, longitude, speed = 0, heading = 0, accuracy = 10, altitude = 0 } = req.body;
    const userId = (req.user as any)?.userId || (req.user as any)?.id;

    if (!userId) {
      return response(res, 401, false, 'Unauthorized: Driver identity missing');
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return response(res, 400, false, 'Latitude and longitude must be numeric');
    }

    const driverData = await Driver.findOne({ user: userId });
    if (!driverData) {
      return response(res, 404, false, 'Driver profile not found');
    }

    const activeTrip = await Trip.findOne({ driver: driverData._id, status: 'dispatched' });
    if (!activeTrip) {
      return response(res, 404, false, 'No active dispatched trip found for this driver');
    }

    const sharedLocation = await GPSLocation.create({
      trip: activeTrip._id,
      vehicle: activeTrip.vehicle,
      driver: driverData._id,
      latitude,
      longitude,
      speed,
      heading,
      accuracy,
      altitude,
      timestamp: new Date(),
    });

    return response(res, 201, true, 'Live location shared successfully', {
      location: {
        latitude: sharedLocation.latitude,
        longitude: sharedLocation.longitude,
        speed: sharedLocation.speed,
        heading: sharedLocation.heading,
        accuracy: sharedLocation.accuracy,
        altitude: sharedLocation.altitude,
        timestamp: sharedLocation.timestamp,
      },
      tripId: activeTrip._id,
    });
  } catch (error: any) {
    console.error('Error in shareDriverLocation:', error);
    return response(res, 500, false, error.message || 'Failed to share live location');
  }
};

export default {
  getActiveTrips,
  getTripLatestLocation,
  getTripLocationHistory,
  getAllActiveTripsGPS,
  shareDriverLocation,
};
