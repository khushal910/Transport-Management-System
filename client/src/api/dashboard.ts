import { fetchBackend } from '@/lib/api';

export interface DashboardData {
  activeTrips: number;
  activeDrivers: number;
  activeVehicles: number;
  totalExpenses: number;
  recentTrips: Array<{
    _id: string;
    driverId: string;
    vehicleId: string;
    status: string;
    startTime: string;
    endTime?: string;
  }>;
  vehicleStatus: Array<{
    _id: string;
    registration: string;
    status: string;
    lastTrip?: string;
  }>;
  driverStatus: Array<{
    _id: string;
    name: string;
    status: string;
    currentTrip?: string;
  }>;
}

export async function getDashboardData() {
  return fetchBackend<DashboardData>(`/api/dashboard/kpis`);
}
