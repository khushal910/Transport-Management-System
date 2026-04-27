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

export interface TripLocationSuggestion {
  placeId: string;
  displayName: string;
  latitude: number;
  longitude: number;
  source?: string;
}

export interface CreateTripPayload {
  vehiclePlateNumber: string;
  cargoWeight: number;
  driverEmail: string;
  startLocationDetails: TripLocationSuggestion;
  endLocationDetails: TripLocationSuggestion;
  revenue: number;
}

export async function getTripList(status?: string, page = 1, limit = 50) {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) query.set('status', status);
  return fetchBackend<TripListPayload>(`/api/trip/get?${query.toString()}`);
}

export async function getTripAddressSuggestions(query: string, limit = 5) {
  const params = new URLSearchParams({ query, limit: String(limit) });
  return fetchBackend<TripLocationSuggestion[]>(`/api/trip/address-suggestions?${params.toString()}`);
}

export async function createTrip(data: CreateTripPayload) {
  return fetchBackend(`/api/trip/create`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTrip(tripId: string, data: any) {
  return fetchBackend(`/api/trip/update/${tripId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateTripStatus(tripId: string, status: string) {
  return fetchBackend(`/api/trip/status/${tripId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteTrip(tripId: string) {
  return fetchBackend(`/api/trip/delete/${tripId}`, {
    method: 'DELETE',
  });
}
