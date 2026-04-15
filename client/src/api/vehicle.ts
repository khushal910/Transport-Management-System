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

export async function createVehicle(data: any) {
  return fetchBackend(`/api/vehicle/create`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateVehicle(vehicleId: string, data: any) {
  return fetchBackend(`/api/vehicle/update/${vehicleId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteVehicle(vehicleId: string) {
  return fetchBackend(`/api/vehicle/delete/${vehicleId}`, {
    method: 'DELETE',
  });
}
