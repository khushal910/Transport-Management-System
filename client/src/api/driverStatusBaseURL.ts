import axios from 'axios';

const driverStatusBaseURL = axios.create({
  baseURL: 'http://localhost:3000/api/driver-status',
  withCredentials: true,
});

/**
 * Update driver status (admin/manager only)
 * Valid transitions:
 * - available → off_duty, suspended
 * - off_duty → available, suspended
 * - suspended → available, off_duty
 * - on_trip → no manual changes allowed
 */
export const updateDriverStatusAPI = async (driverId: string, status: string) => {
  console.log(`[API] Updating driver ${driverId} status to ${status}`);
  const response = await driverStatusBaseURL.post(`/${driverId}`, { status });
  console.log(`[API] Update response:`, response.data);
  return response.data;
};

/**
 * Get driver status history
 */
export const getDriverStatusHistoryAPI = async (driverId: string) => {
  const response = await driverStatusBaseURL.get(`/history/${driverId}`);
  return response.data;
};

export default driverStatusBaseURL;
