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
  user?: {
    name?: string;
    email?: string;
  };
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
