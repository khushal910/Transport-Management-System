import { fetchBackend } from '@/lib/api';
import type { MaintenanceLog } from '@/types/fleet';

export interface MaintenanceCreatePayload {
  vehicleId: string;
  description: string;
  serviceDate: string;
  cost: number;
  distance?: number;
}

export interface MaintenanceListPayload {
  logs: MaintenanceLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getMaintenanceList(page = 1, limit = 50) {
  return fetchBackend<MaintenanceListPayload>(`/api/maintenance/list?page=${page}&limit=${limit}`);
}

export async function createMaintenance(data: MaintenanceCreatePayload) {
  return fetchBackend(`/api/maintenance/create`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMaintenanceStatus(maintenanceId: string, status: string) {
  return fetchBackend(`/api/maintenance/status/${maintenanceId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
