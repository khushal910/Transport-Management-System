import { fetchBackend } from '@/lib/api';

export interface Driver {
  _id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverListPayload {
  drivers: Driver[];
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
