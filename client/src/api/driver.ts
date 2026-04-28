import { fetchBackend } from '@/lib/api';

export interface DriverListItem {
  _id: string;
  name?: string;
  email?: string;
  status?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  licenseCategory?: string;
  safetyScore?: number;
  completionRate?: number;
  complaints?: number;
  createdAt?: string;
  assignedVehicle?: {
    _id: string;
    registrationNumber: string;
    model?: string;
    make?: string;
  } | null;
  user?: {
    name?: string;
    email?: string;
    lifecycleStatus?: string;
  };
}

export interface AssignVehiclePayload {
  driverId: string;
  vehicleId: string;
}

export interface RemoveVehiclePayload {
  driverId: string;
}

export interface DriverListPayload {
  drivers: DriverListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getDriverList(page = 1, limit = 50) {
  return fetchBackend<DriverListPayload>(`/api/driver/list?page=${page}&limit=${limit}`);
}

export async function getDriverPerformance(page = 1, limit = 50) {
  return fetchBackend<DriverListPayload>(`/api/driver/performance?page=${page}&limit=${limit}`);
}

export async function assignVehicleToDriver(payload: AssignVehiclePayload) {
  return fetchBackend<{ message: string }>('/api/driver/assign-vehicle', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function removeVehicleFromDriver(payload: RemoveVehiclePayload) {
  return fetchBackend<{ message: string }>('/api/driver/remove-vehicle', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateDriverStatus(driverId: string, status: string) {
  return fetchBackend<{ message: string }>(`/api/driver-status/${driverId}`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}

export async function updateDriverStatusSelf(status: string) {
  return fetchBackend<{ message: string }>(`/api/driver-status/self`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}
