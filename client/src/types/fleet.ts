export type UserRole = 'manager' | 'driver' | 'dispatcher' | 'safety_officer' | 'financial_analyst';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
}

export interface Company {
  _id: string;
  name: string;
  registrationNumber: string;
  address: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
}

export type VehicleType = 'truck' | 'van' | 'bike';
export type VehicleStatus = 'available' | 'on_trip' | 'assigned' | 'in_shop' | 'retired';

export interface Vehicle {
  _id: string;
  company: string;
  name: string;
  licensePlate: string;
  model: string;
  vehicleType: VehicleType;
  maxCapacity: number;
  odometer: number;
  status: VehicleStatus;
  isDeleted: boolean;
  createdAt: string;
}

export type DriverStatus = 'available' | 'on_duty' | 'off_duty' | 'on_trip' | 'suspended';

export interface Driver {
  _id: string;
  user: User;
  licenseNumber: string;
  licenseExpiry: string;
  licenseCategory: VehicleType;
  safetyScore: number;
  status: DriverStatus;
  complaints: number;
  assignedTrips: number;
  completedTrips: number;
  completionRate: number;
}

export type TripStatus = 'draft' | 'dispatched' | 'completed' | 'cancelled';

export interface TripLocationDetails {
  placeId: string;
  displayName: string;
  latitude: number;
  longitude: number;
  source?: string;
}

export interface Trip {
  _id: string;
  company: string;
  vehicle: Vehicle;
  driver: Driver;
  cargoWeight: number;
  startLocation: string;
  endLocation: string;
  startLocationDetails?: TripLocationDetails;
  endLocationDetails?: TripLocationDetails;
  revenue: number;
  status: TripStatus;
  startOdometer?: number;
  endOdometer?: number;
  createdAt: string;
}

export type MaintenanceStatus = 'pending' | 'completed' | 'cancelled';

export interface MaintenanceLog {
  _id: string;
  company: string;
  vehicle: Vehicle;
  description: string;
  cost: number;
  distance: number;
  serviceDate: string;
  status: MaintenanceStatus;
  createdAt: string;
}

export type ExpenseStatus = 'pending' | 'completed' | 'cancelled';

export interface Expense {
  _id: string;
  company: string;
  trip: Trip;
  driver: Driver;
  vehicle: Vehicle;
  fuelCost: number;
  miscExpense: number;
  distance: number;
  status: ExpenseStatus;
  date: string;
}

export interface DashboardKPIs {
  overview: {
    totalVehicles: number;
    activeVehicles: number;
    vehiclesInMaintenance: number;
    retiredVehicles: number;
    totalDrivers: number;
    activeDrivers: number;
  };
  trips: {
    totalTrips: number;
    completedTrips: number;
    draftTrips: number;
    dispatchedTrips: number;
    completionRate: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    roi: number;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
