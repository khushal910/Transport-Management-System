import { fetchBackend } from '@/lib/api';

export interface MonthlyFinancial {
  month: string;
  revenue: number;
  fuelCost: number;
  maintenanceCost: number;
  netProfit: number;
}

export interface VehicleROI {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  revenue: number;
  fuelCost: number;
  maintenanceCost: number;
  totalExpense: number;
  netProfit: number;
  roiPercentage: number;
  trips: number;
}

export interface UtilizationRate {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  totalTrips: number;
  averageDistance: number;
  status: string;
  utilizationPercent: number;
  isDeadStock: boolean;
}

export interface FleetKPIs {
  totalTrips: number;
  totalRevenue: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalExpense: number;
  totalNetProfit: number;
  fleetROI: number;
  averageUtilization: number;
  activeVehicles: number;
  totalVehicles: number;
  deadStockVehicles: number;
}

export interface FuelEfficiencyItem {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  totalDistance: number;
  totalFuelCost: number;
  kmPerLiter: number;
  efficiency: string;
}

export interface AnalyticsData {
  fuelEfficiency: FuelEfficiencyItem[];
  vehicleROI: VehicleROI[];
  utilizationRate: UtilizationRate[];
  deadStock: Array<{ vehicleId: string; vehicleName: string; licensePlate: string }>;
  monthlyFinancial: MonthlyFinancial[];
  topCostliestVehicles: VehicleROI[];
  fleetKPIs: FleetKPIs;
}

export async function getAnalyticsData(dateRange?: { start: string; end: string }) {
  const params = dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : '';
  return fetchBackend<AnalyticsData>(`/api/analytics/dashboard${params}`);
}
