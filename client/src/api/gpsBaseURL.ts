import axios from 'axios';

// Create axios instance for GPS API
const gpsBaseURL = axios.create({
  baseURL: 'http://localhost:3000/api/gps',
  withCredentials: true,
});

/**
 * GPS Tracking API Client
 * Handles all GPS-related API calls with proper error handling
 */

// Get active trips list
export const getActiveTrips = async (search?: string) => {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const response = await gpsBaseURL.get(`/active-trips?${params}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching active trips:', error.response?.data || error.message);
    throw error;
  }
};

// Get latest GPS location for a trip
export const getTripLatestLocation = async (tripId: string) => {
  try {
    const response = await gpsBaseURL.get(`/trip/${tripId}/latest`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching trip ${tripId} location:`, error.response?.data || error.message);
    throw error;
  }
};

// Get GPS history for a trip
export const getTripLocationHistory = async (tripId: string, limit: number = 100) => {
  try {
    const response = await gpsBaseURL.get(`/trip/${tripId}/history?limit=${limit}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching trip ${tripId} history:`, error.response?.data || error.message);
    throw error;
  }
};

// Get all active trips with GPS data
export const getAllActiveTripsGPS = async () => {
  try {
    const response = await gpsBaseURL.get('/all-active');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching all active trips GPS:', error.response?.data || error.message);
    throw error;
  }
};

export default gpsBaseURL;
