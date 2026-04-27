import { fetchBackend } from '@/lib/api';
import type { TripLocationDetails } from '@/types/fleet';

export interface ActiveTripTrackingItem {
  _id: string;
  vehicleName?: string;
  licensePlate?: string;
  driverName?: string;
  driverEmail?: string;
  startLocation?: string;
  endLocation?: string;
  startLocationDetails?: TripLocationDetails;
  endLocationDetails?: TripLocationDetails;
  cargoWeight?: number;
  status: string;
  createdAt: string;
}

export interface ActiveTripsTrackingPayload {
  trips: ActiveTripTrackingItem[];
  total: number;
}

export interface TripLatestLocationPayload {
  location: {
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    accuracy: number;
    altitude: number;
    timestamp: string;
  };
  vehicle: {
    name?: string;
    licensePlate?: string;
  };
  driver: {
    email?: string;
  };
  route: {
    startLocation?: string;
    endLocation?: string;
    startLocationDetails?: TripLocationDetails;
    endLocationDetails?: TripLocationDetails;
  };
}

export interface TripLocationHistoryPayload {
  history: Array<{
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    accuracy: number;
    altitude: number;
    timestamp: string;
  }>;
  tripInfo: {
    vehicleName?: string;
    licensePlate?: string;
    driverEmail?: string;
    startLocation?: string;
    endLocation?: string;
    startLocationDetails?: TripLocationDetails;
    endLocationDetails?: TripLocationDetails;
  };
  totalRecords: number;
}

export async function getActiveTripsForTracking(search?: string) {
  const params = new URLSearchParams();
  if (search?.trim()) {
    params.set('search', search.trim());
  }

  const query = params.toString();
  return fetchBackend<ActiveTripsTrackingPayload>(`/api/gps/active-trips${query ? `?${query}` : ''}`);
}

export async function getTripLatestLocation(tripId: string) {
  return fetchBackend<TripLatestLocationPayload>(`/api/gps/trip/${tripId}/latest`);
}

export async function getTripLocationHistory(tripId: string, limit = 30) {
  return fetchBackend<TripLocationHistoryPayload>(`/api/gps/trip/${tripId}/history?limit=${limit}`);
}
