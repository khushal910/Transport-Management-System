import { fetchBackend } from '@/lib/api';
import type { Trip } from '@/types/fleet';

export interface TripListPayload {
  trips: Trip[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getTripList(status?: string, page = 1, limit = 50) {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) query.set('status', status);
  return fetchBackend<TripListPayload>(`/api/trip/list?${query.toString()}`);
}
