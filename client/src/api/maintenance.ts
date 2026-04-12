import { fetchBackend } from '@/lib/api';

export interface Maintenance {
  _id: string;
  vehicleId: string;
  type: string;
  description: string;
  startDate: string;
  endDate?: string;
  cost: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceListPayload {
  logs: Maintenance[];
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

export async function createMaintenance(data: Omit<Maintenance, '_id' | 'createdAt' | 'updatedAt'>) {
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

export async function updateMaintenance(maintenanceId: string, data: Partial<Maintenance>) {
  return fetchBackend(`/api/maintenance/status/${maintenanceId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: data.status ?? 'pending' }),
  });
}
