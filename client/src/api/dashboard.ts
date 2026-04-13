import { fetchBackend } from '@/lib/api';

export interface DashboardKPIs {
  activeFleet: number;
  maintenanceAlerts: number;
  pendingCargo: number;
  completedToday: number;
  pendingAssignment: number;
}

export interface TripData {
  tripId: string;
  tripNumber: string;
  vehicle: {
    licensePlate: string;
    vehicleType: string;
    model: string;
  };
  driver: {
    name: string;
    email: string;
  };
  status: string;
  startOdometer: number;
  endOdometer: number;
  cargoWeight: number;
  revenue: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  trips: TripData[];
}

export interface SafetyMetrics {
  expiredLicenses: number;
  lowSafetyScores: number;
  highRiskDrivers: number;
  recentAccidents: number;
  maintenanceAlerts: number;
}

export async function getDashboardData(filters?: { status?: string; vehicleType?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.vehicleType) params.set('vehicleType', filters.vehicleType);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchBackend<DashboardData>(`/api/dashboard/kpis${query}`);
}

export async function getSafetyMetrics() {
  return fetchBackend<SafetyMetrics>('/api/dashboard/safety-metrics');
}
