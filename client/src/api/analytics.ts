import { fetchBackend } from '@/lib/api';

export interface AnalyticsData {
  totalTrips: number;
  totalDistance: number;
  totalExpenses: number;
  averageSpeed: number;
  fuelEfficiency: number;
  driverPerformance: Array<{
    driverId: string;
    name: string;
    trips: number;
    distance: number;
    safetyRating: number;
  }>;
  vehiclePerformance: Array<{
    vehicleId: string;
    registration: string;
    trips: number;
    distance: number;
    maintenanceCost: number;
  }>;
}

export async function getAnalyticsData(dateRange?: { start: string; end: string }) {
  const params = dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : '';
  return fetchBackend<AnalyticsData>(`/api/analytics/dashboard${params}`);
}
