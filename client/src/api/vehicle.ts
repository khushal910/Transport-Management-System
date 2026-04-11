import { fetchBackend } from '@/lib/api';
import type { Vehicle } from '@/types/fleet';

export interface VehicleListPayload {
  vehicles: Vehicle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getVehicleList(page = 1, limit = 50) {
  return fetchBackend<VehicleListPayload>(`/api/vehicle/list?page=${page}&limit=${limit}`);
}
