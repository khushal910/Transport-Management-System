import type { Vehicle, Driver, Trip, MaintenanceLog, Expense, User, DashboardKPIs } from '@/types/fleet';

export const mockUser: User = {
  _id: 'u1',
  name: 'Raj Kumar',
  email: 'raj@fleetflow.com',
  role: 'manager',
  company: 'c1',
};

export const mockVehicles: Vehicle[] = [
  { _id: 'v1', company: 'c1', name: 'Truck-001', licensePlate: 'DL-01-AB-1234', model: 'Tata 1518', vehicleType: 'truck', maxCapacity: 5000, odometer: 45000, status: 'available', isDeleted: false, createdAt: '2026-01-15T10:00:00Z' },
  { _id: 'v2', company: 'c1', name: 'Van-002', licensePlate: 'DL-02-CD-5678', model: 'Mahindra Supro', vehicleType: 'van', maxCapacity: 1500, odometer: 32000, status: 'on_trip', isDeleted: false, createdAt: '2026-01-20T10:00:00Z' },
  { _id: 'v3', company: 'c1', name: 'Truck-003', licensePlate: 'DL-03-EF-9012', model: 'Ashok Leyland', vehicleType: 'truck', maxCapacity: 8000, odometer: 78000, status: 'in_shop', isDeleted: false, createdAt: '2026-02-01T10:00:00Z' },
  { _id: 'v4', company: 'c1', name: 'Bike-004', licensePlate: 'DL-04-GH-3456', model: 'Honda CB', vehicleType: 'bike', maxCapacity: 50, odometer: 12000, status: 'available', isDeleted: false, createdAt: '2026-02-10T10:00:00Z' },
  { _id: 'v5', company: 'c1', name: 'Truck-005', licensePlate: 'DL-05-IJ-7890', model: 'Eicher Pro', vehicleType: 'truck', maxCapacity: 6000, odometer: 55000, status: 'assigned', isDeleted: false, createdAt: '2026-02-15T10:00:00Z' },
  { _id: 'v6', company: 'c1', name: 'Van-006', licensePlate: 'DL-06-KL-2345', model: 'Tata Ace', vehicleType: 'van', maxCapacity: 1000, odometer: 28000, status: 'retired', isDeleted: false, createdAt: '2025-06-01T10:00:00Z' },
];

const mockUserDrivers: User[] = [
  { _id: 'u2', name: 'Arjun Sharma', email: 'arjun@fleetflow.com', role: 'driver', company: 'c1' },
  { _id: 'u3', name: 'Priya Patel', email: 'priya@fleetflow.com', role: 'driver', company: 'c1' },
  { _id: 'u4', name: 'Vikram Singh', email: 'vikram@fleetflow.com', role: 'driver', company: 'c1' },
  { _id: 'u5', name: 'Meena Devi', email: 'meena@fleetflow.com', role: 'driver', company: 'c1' },
];

export const mockDrivers: Driver[] = [
  { _id: 'd1', user: mockUserDrivers[0], licenseNumber: 'DL15PA017', licenseExpiry: '2027-12-31', licenseCategory: 'truck', safetyScore: 98, status: 'on_trip', complaints: 0, assignedTrips: 95, completedTrips: 85, completionRate: 89.5 },
  { _id: 'd2', user: mockUserDrivers[1], licenseNumber: 'MH12BC089', licenseExpiry: '2027-06-15', licenseCategory: 'van', safetyScore: 92, status: 'off_duty', complaints: 1, assignedTrips: 60, completedTrips: 55, completionRate: 91.7 },
  { _id: 'd3', user: mockUserDrivers[2], licenseNumber: 'KA01XY456', licenseExpiry: '2026-09-30', licenseCategory: 'truck', safetyScore: 85, status: 'on_duty', complaints: 3, assignedTrips: 120, completedTrips: 100, completionRate: 83.3 },
  { _id: 'd4', user: mockUserDrivers[3], licenseNumber: 'RJ14MN321', licenseExpiry: '2028-03-01', licenseCategory: 'bike', safetyScore: 75, status: 'suspended', complaints: 5, assignedTrips: 40, completedTrips: 30, completionRate: 75.0 },
];

export const mockTrips: Trip[] = [
  { _id: 't1', company: 'c1', vehicle: mockVehicles[1], driver: mockDrivers[0], cargoWeight: 1200, startLocation: 'Delhi', endLocation: 'Bangalore', revenue: 15000, status: 'dispatched', createdAt: '2026-03-20T10:00:00Z' },
  { _id: 't2', company: 'c1', vehicle: mockVehicles[0], driver: mockDrivers[1], cargoWeight: 3500, startLocation: 'Mumbai', endLocation: 'Chennai', revenue: 22000, status: 'completed', startOdometer: 44000, endOdometer: 45300, createdAt: '2026-03-18T10:00:00Z' },
  { _id: 't3', company: 'c1', vehicle: mockVehicles[4], driver: mockDrivers[2], cargoWeight: 4500, startLocation: 'Pune', endLocation: 'Hyderabad', revenue: 18000, status: 'draft', createdAt: '2026-03-25T10:00:00Z' },
  { _id: 't4', company: 'c1', vehicle: mockVehicles[3], driver: mockDrivers[1], cargoWeight: 30, startLocation: 'Jaipur', endLocation: 'Udaipur', revenue: 3000, status: 'completed', createdAt: '2026-03-10T10:00:00Z' },
  { _id: 't5', company: 'c1', vehicle: mockVehicles[0], driver: mockDrivers[2], cargoWeight: 4000, startLocation: 'Kolkata', endLocation: 'Patna', revenue: 12000, status: 'cancelled', createdAt: '2026-03-05T10:00:00Z' },
];

export const mockMaintenance: MaintenanceLog[] = [
  { _id: 'm1', company: 'c1', vehicle: mockVehicles[2], description: 'Engine oil change and filter replacement', cost: 5000, distance: 150000, serviceDate: '2026-03-26T00:00:00Z', status: 'pending', createdAt: '2026-03-25T10:00:00Z' },
  { _id: 'm2', company: 'c1', vehicle: mockVehicles[0], description: 'Brake pad replacement', cost: 8000, distance: 45000, serviceDate: '2026-03-15T00:00:00Z', status: 'completed', createdAt: '2026-03-14T10:00:00Z' },
  { _id: 'm3', company: 'c1', vehicle: mockVehicles[1], description: 'Tire rotation and alignment', cost: 3500, distance: 32000, serviceDate: '2026-03-20T00:00:00Z', status: 'pending', createdAt: '2026-03-19T10:00:00Z' },
];

export const mockExpenses: Expense[] = [
  { _id: 'e1', company: 'c1', trip: mockTrips[1], driver: mockDrivers[1], vehicle: mockVehicles[0], fuelCost: 2500, miscExpense: 500, distance: 1300, status: 'pending', date: '2026-03-18T10:00:00Z' },
  { _id: 'e2', company: 'c1', trip: mockTrips[3], driver: mockDrivers[1], vehicle: mockVehicles[3], fuelCost: 800, miscExpense: 200, distance: 340, status: 'completed', date: '2026-03-10T10:00:00Z' },
];

export const mockKPIs: DashboardKPIs = {
  overview: {
    totalVehicles: 25,
    activeVehicles: 18,
    vehiclesInMaintenance: 3,
    retiredVehicles: 4,
    totalDrivers: 30,
    activeDrivers: 22,
  },
  trips: {
    totalTrips: 450,
    completedTrips: 380,
    draftTrips: 50,
    dispatchedTrips: 20,
    completionRate: 84.4,
  },
  revenueMetrics: {
    totalRevenue: 4500000,
    totalExpenses: 1200000,
    netProfit: 3300000,
    roi: 275,
  },
};

export const mockEmployees: (User & { driver?: Driver })[] = [
  { ...mockUserDrivers[0], driver: mockDrivers[0] },
  { ...mockUserDrivers[1], driver: mockDrivers[1] },
  { ...mockUserDrivers[2], driver: mockDrivers[2] },
  { ...mockUserDrivers[3], driver: mockDrivers[3] },
  { _id: 'u6', name: 'Vikas Kumar', email: 'vikas@fleetflow.com', role: 'dispatcher', company: 'c1' },
  { _id: 'u7', name: 'Sunita Rao', email: 'sunita@fleetflow.com', role: 'safety_officer', company: 'c1' },
  { _id: 'u8', name: 'Amit Joshi', email: 'amit@fleetflow.com', role: 'financial_analyst', company: 'c1' },
];
