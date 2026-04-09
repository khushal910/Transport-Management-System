import GPSLocation from '../models/gpsLocation.schema';
import { Trip } from '../models/trip.schema';
import Vehicle from '../models/vehicle.schema';
import Driver from '../models/driver.schema';

/**
 * GPS Simulator Service - Generates mock GPS data for active trips
 * Used for testing and demo purposes
 */

let simulatorInterval: NodeJS.Timeout | null = null;
let activeLoginCount = 0;

interface GPSUpdate {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  altitude: number;
  timestamp: Date;
}

// India coordinates (for demo - generates random locations within India bounds)
const INDIA_BOUNDS = {
  north: 35.5,
  south: 8.4,
  east: 97.4,
  west: 68.2,
};

// Common route waypoints (demo locations)
const DEMO_ROUTES: Record<string, Array<{ lat: number; lng: number; name: string }>> = {
  'surat-ahmedabad': [
    { lat: 21.1458, lng: 72.8297, name: 'Surat' },
    { lat: 22.5726, lng: 72.6168, name: 'Ahmedabad' },
  ],
  'mumbai-pune': [
    { lat: 19.076, lng: 72.8777, name: 'Mumbai' },
    { lat: 18.5204, lng: 73.8567, name: 'Pune' },
  ],
  'bangalore-hyderabad': [
    { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
    { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
  ],
  'delhi-agra': [
    { lat: 28.6139, lng: 77.209, name: 'Delhi' },
    { lat: 27.1767, lng: 78.0081, name: 'Agra' },
  ],
};

/**
 * Generate random GPS location near a given point
 */
function generateNearbyLocation(
  centerLat: number,
  centerLng: number,
  radiusKm: number = 2
): { lat: number; lng: number } {
  const earthRadiusKm = 6371;
  const radiusRadians = radiusKm / earthRadiusKm;
  
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radiusRadians;
  
  const lat = Math.asin(
    Math.sin((centerLat * Math.PI) / 180) * Math.cos(distance) +
      Math.cos((centerLat * Math.PI) / 180) * Math.sin(distance) * Math.cos(angle)
  );
  
  const lng =
    ((centerLng * Math.PI) / 180) +
    Math.atan2(
      Math.sin(angle) * Math.sin(distance) * Math.cos((centerLat * Math.PI) / 180),
      Math.cos(distance) - Math.sin((centerLat * Math.PI) / 180) * Math.sin(lat)
    );
  
  return {
    lat: (lat * 180) / Math.PI,
    lng: (lng * 180) / Math.PI,
  };
}

/**
 * Get a route for a given trip
 */
function getRouteForTrip(
  startLocation: string | undefined,
  endLocation: string | undefined
): Array<{ lat: number; lng: number; name: string }> {
  const routeKey = `${startLocation?.toLowerCase().replace(/ /g, '-')}-${endLocation?.toLowerCase().replace(/ /g, '-')}`;
  
  if (DEMO_ROUTES[routeKey]) {
    return DEMO_ROUTES[routeKey];
  }
  
  // Default route if not found
  return [
    { lat: 21.1458, lng: 72.8297, name: startLocation || 'Start' },
    { lat: 22.5726, lng: 72.6168, name: endLocation || 'End' },
  ];
}

/**
 * Generate mock GPS update for active trip
 */
export async function generateMockGPSUpdate(tripId: string): Promise<GPSUpdate> {
  try {
    const trip = await Trip.findById(tripId).populate('vehicle driver');
    
    if (!trip || trip.status !== 'dispatched') {
      throw new Error('Trip not found or not in dispatched status');
    }
    
    const route = getRouteForTrip(trip.startLocation, trip.endLocation);
    const startPoint = route[0];
    
    // Generate location within 20km of route start (simulating movement along route)
    const baseLocation = Math.random() > 0.5 ? route[0] : route[1];
    const location = generateNearbyLocation(baseLocation.lat, baseLocation.lng, 20);
    
    return {
      latitude: location.lat,
      longitude: location.lng,
      speed: Math.floor(Math.random() * 80) + 20, // 20-100 km/h
      heading: Math.floor(Math.random() * 360),
      accuracy: Math.random() * 15 + 5, // 5-20 meters
      altitude: Math.floor(Math.random() * 500) + 100, // 100-600 meters
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error generating mock GPS update:', error);
    throw error;
  }
}

/**
 * Simulate GPS updates for all active trips (called periodically)
 */
export async function simulateActiveTripsGPS(): Promise<number> {
  try {
    const activeTrips = await Trip.find({
      status: 'dispatched',
    }).limit(100); // Limit to 100 active trips per simulation
    
    let updatesCount = 0;
    
    for (const trip of activeTrips) {
      try {
        const gpsUpdate = await generateMockGPSUpdate(trip._id.toString());
        
        await GPSLocation.create({
          trip: trip._id,
          vehicle: trip.vehicle,
          driver: trip.driver,
          latitude: gpsUpdate.latitude,
          longitude: gpsUpdate.longitude,
          speed: gpsUpdate.speed,
          heading: gpsUpdate.heading,
          accuracy: gpsUpdate.accuracy,
          altitude: gpsUpdate.altitude,
          timestamp: gpsUpdate.timestamp,
        });
        
        updatesCount++;
      } catch (error) {
        console.error(`Error simulating GPS for trip ${trip._id}:`, error);
      }
    }
    
    return updatesCount;
  } catch (error) {
    console.error('Error in simulateActiveTripsGPS:', error);
    throw error;
  }
}

export function startGPSSimulator(): void {
  if (simulatorInterval) {
    return;
  }

  simulatorInterval = setInterval(async () => {
    try {
      const updates = await simulateActiveTripsGPS();
      if (updates > 0) {
        console.log(`[GPS Simulator] Generated ${updates} GPS updates`);
      }
    } catch (error) {
      console.error('[GPS Simulator] Error:', error);
    }
  }, 10000);

  console.log('[GPS Simulator] Started - will generate mock GPS data every 10 seconds');
}

export function stopGPSSimulator(): void {
  if (!simulatorInterval) {
    return;
  }

  clearInterval(simulatorInterval);
  simulatorInterval = null;
  console.log('[GPS Simulator] Stopped - mock GPS updates are paused until a user logs in');
}

export function userLoggedIn(): void {
  activeLoginCount += 1;
  if (activeLoginCount === 1) {
    startGPSSimulator();
  }
}

export function userLoggedOut(): void {
  activeLoginCount = Math.max(0, activeLoginCount - 1);
  if (activeLoginCount === 0) {
    stopGPSSimulator();
  }
}

/**
 * Get latest GPS location for a trip
 */
export async function getLatestTripLocation(tripId: string): Promise<any> {
  try {
    const location = await GPSLocation.findOne({ trip: tripId })
      .sort({ timestamp: -1 })
      .populate('vehicle driver');
    
    return location;
  } catch (error) {
    console.error('Error getting latest trip location:', error);
    throw error;
  }
}

/**
 * Get GPS history for a trip (last 100 readings)
 */
export async function getTripGPSHistory(tripId: string, limit: number = 100): Promise<any[]> {
  try {
    const history = await GPSLocation.find({ trip: tripId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    return history.reverse(); // Return in chronological order
  } catch (error) {
    console.error('Error getting trip GPS history:', error);
    throw error;
  }
}

/**
 * Get all active trips with latest GPS data
 */
export async function getActiveTripsWithGPS(): Promise<any[]> {
  try {
    const activeTrips = await Trip.find({
      status: 'dispatched',
    })
      .populate('vehicle driver')
      .lean()
      .limit(100);
    
    const tripsWithGPS = await Promise.all(
      activeTrips.map(async (trip) => {
        const latestLocation = await getLatestTripLocation(trip._id.toString());
        return {
          ...trip,
          latestLocation,
        };
      })
    );
    
    return tripsWithGPS;
  } catch (error) {
    console.error('Error getting active trips with GPS:', error);
    throw error;
  }
}

export default {
  generateMockGPSUpdate,
  simulateActiveTripsGPS,
  getLatestTripLocation,
  getTripGPSHistory,
  getActiveTripsWithGPS,
};
