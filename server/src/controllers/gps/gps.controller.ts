import mongoose from 'mongoose';
import GPSLocation from '../../models/gpsLocation.schema';
import { Trip } from '../../models/trip.schema';
import Vehicle from '../../models/vehicle.schema';
import Driver from '../../models/driver.schema';
import StandardResponse from '../../response/response';
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

    const response = new StandardResponse(
      true,
      'Active trips retrieved successfully',
      {
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
      }
    );

    res.json(response);
  } catch (error: any) {
    console.error('Error in getActiveTrips:', error);
    const response = new StandardResponse(
      false,
      error.message || 'Failed to retrieve active trips',
      null
    );
    res.status(500).json(response);
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
      const response = new StandardResponse(
        false,
        'Invalid trip ID format',
        null
      );
      res.status(400).json(response);
      return;
    }

    // Validate trip exists and belongs to user's company
    const trip = await Trip.findOne({
      _id: tripId,
      company: companyId,
    }).populate('driver');

    if (!trip) {
      const response = new StandardResponse(
        false,
        'Trip not found or access denied',
        null
      );
      res.status(404).json(response);
      return;
    }

    // Driver can only view their own trip
    if (userRole === 'driver') {
      if (!userId) {
        const response = new StandardResponse(
          false,
          'Unauthorized: Driver identity missing',
          null
        );
        res.status(401).json(response);
        return;
      }
      const driverData = await Driver.findOne({ user: userId });
      if (!driverData || trip.driver._id.toString() !== driverData._id.toString()) {
        const response = new StandardResponse(
          false,
          'You can only view your own trip GPS',
          null
        );
        res.status(403).json(response);
        return;
      }
    }

    // Get latest GPS location
    const latestLocation = await getLatestTripLocation(tripId);

    if (!latestLocation) {
      const response = new StandardResponse(
        false,
        'No GPS data available for this trip yet',
        null
      );
      res.status(404).json(response);
      return;
    }

    const response = new StandardResponse(
      true,
      'Latest GPS location retrieved',
      {
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
      }
    );

    res.json(response);
  } catch (error: any) {
    console.error('Error in getTripLatestLocation:', error);
    const response = new StandardResponse(
      false,
      error.message || 'Failed to retrieve trip location',
      null
    );
    res.status(500).json(response);
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
      const response = new StandardResponse(
        false,
        'Invalid trip ID format',
        null
      );
      res.status(400).json(response);
      return;
    }
    const parsedLimit = Math.min(parseInt(limit) || 100, 500); // Max 500 records

    // Validate trip exists and belongs to user's company
    const trip = await Trip.findOne({
      _id: tripId,
      company: companyId,
    }).populate('driver');

    if (!trip) {
      const response = new StandardResponse(
        false,
        'Trip not found or access denied',
        null
      );
      res.status(404).json(response);
      return;
    }

    // Driver can only view their own trip
    if (userRole === 'driver') {
      if (!userId) {
        const response = new StandardResponse(
          false,
          'Unauthorized: Driver identity missing',
          null
        );
        res.status(401).json(response);
        return;
      }
      const driverData = await Driver.findOne({ user: userId });
      if (!driverData || trip.driver._id.toString() !== driverData._id.toString()) {
        const response = new StandardResponse(
          false,
          'You can only view your own trip GPS',
          null
        );
        res.status(403).json(response);
        return;
      }
    }

    // Get GPS history
    const history = await getTripGPSHistory(tripId, parsedLimit);

    if (!history.length) {
      const response = new StandardResponse(
        false,
        'No GPS data available for this trip',
        null
      );
      res.status(404).json(response);
      return;
    }

    const response = new StandardResponse(
      true,
      `Retrieved ${history.length} GPS records`,
      {
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
      }
    );

    res.json(response);
  } catch (error: any) {
    console.error('Error in getTripLocationHistory:', error);
    const response = new StandardResponse(
      false,
      error.message || 'Failed to retrieve GPS history',
      null
    );
    res.status(500).json(response);
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

    const response = new StandardResponse(
      true,
      'Active trips GPS retrieved',
      {
        trips: tripsWithGPS,
        total: tripsWithGPS.length,
      }
    );

    res.json(response);
  } catch (error: any) {
    console.error('Error in getAllActiveTripsGPS:', error);
    const response = new StandardResponse(
      false,
      error.message || 'Failed to retrieve active trips GPS',
      null
    );
    res.status(500).json(response);
  }
};

export default {
  getActiveTrips,
  getTripLatestLocation,
  getTripLocationHistory,
  getAllActiveTripsGPS,
};
