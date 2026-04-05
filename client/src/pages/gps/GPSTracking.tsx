import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNotification } from '../../hooks/useNotification';
import {
  getActiveTrips,
  getTripLatestLocation,
  getTripLocationHistory,
} from '../../api/gpsBaseURL';
import { PageContainer, PageHeader } from '../../components/ui';
import { MapPin, Loader2, AlertCircle, Search, Navigation, Gauge } from 'lucide-react';

// Fix Leaflet icons for Vite environment
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Trip {
  _id: string;
  vehicleName: string;
  licensePlate: string;
  driverName: string;
  startLocation: string;
  endLocation: string;
  cargoWeight: string;
  status: string;
  createdAt: string;
}

interface GPSLocation {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  altitude: number;
  timestamp: string;
}

interface TripWithGPS {
  location: GPSLocation;
  vehicle: { name: string; licensePlate: string };
  driver: { email: string };
  route: { startLocation: string; endLocation: string };
}

interface GPSHistory {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  altitude: number;
  timestamp: string;
}

const GPSTracking: React.FC = () => {
  const { notifyError, notifySuccess } = useNotification();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [tripLocationData, setTripLocationData] = useState<TripWithGPS | null>(null);
  const [gpsHistory, setGpsHistory] = useState<GPSHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingGPS, setIsFetchingGPS] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch active trips
  const fetchActiveTrips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getActiveTrips(searchQuery);
      if (response.success) {
        setTrips(response.data.trips);
        if (response.data.trips.length === 0) {
          setError('No active trips found');
        }
      } else {
        setError(response.message || 'Failed to fetch active trips');
        notifyError(response.message);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error fetching active trips';
      setError(message);
      notifyError(message);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // Fetch GPS location for selected trip
  const fetchTripLocation = useCallback(async (tripId: string) => {
    setIsFetchingGPS(true);
    try {
      const [locationRes, historyRes] = await Promise.all([
        getTripLatestLocation(tripId),
        getTripLocationHistory(tripId, 100),
      ]);

      if (locationRes.success) {
        setTripLocationData(locationRes.data);
        updateMapWithLocation(locationRes.data.location);
      }

      if (historyRes.success) {
        setGpsHistory(historyRes.data.history);
        updateMapWithTrail(historyRes.data.history);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error fetching GPS data';
      notifyError(message);
    } finally {
      setIsFetchingGPS(false);
    }
  }, []);

  // Update map with vehicle marker
  const updateMapWithLocation = useCallback((location: GPSLocation) => {
    if (!mapRef.current || !L) return;

    const { latitude, longitude } = location;
    const map = mapRef.current;

    // Center map on new location
    if (!map.getBounds().contains([latitude, longitude])) {
      map.setView([latitude, longitude], 13);
    }

    // Remove old marker
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    // Add new marker with rotation based on heading
    const rotationIcon = L.divIcon({
      html: `<div style="transform: rotate(${location.heading}deg); display: flex; align-items: center; justify-content: center;">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="#3B82F6" stroke="#1E40AF" stroke-width="2"/>
          <path d="M16 6 L20 14 L12 14 Z" fill="white"/>
          <circle cx="16" cy="16" r="3" fill="white"/>
        </svg>
      </div>`,
      className: 'gps-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    markerRef.current = L.marker([latitude, longitude], {
      icon: rotationIcon,
    }).addTo(map);

    // Add popup with vehicle info
    if (tripLocationData) {
      markerRef.current.bindPopup(`
        <div style="padding: 8px; font-size: 12px;">
          <strong>${tripLocationData.vehicle.name}</strong><br/>
          Plate: ${tripLocationData.vehicle.licensePlate}<br/>
          Speed: ${location.speed} km/h<br/>
          Altitude: ${location.altitude}m<br/>
          Accuracy: ±${location.accuracy}m
        </div>
      `);
    }
  }, [tripLocationData]);

  // Update map with GPS trail
  const updateMapWithTrail = useCallback((history: GPSHistory[]) => {
    if (!mapRef.current || !L || history.length === 0) return;

    const map = mapRef.current;

    // Remove old polyline
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }

    // Create polyline from GPS history
    const coordinates = history.map((loc) => [loc.latitude, loc.longitude]);

    polylineRef.current = L.polyline(coordinates, {
      color: '#3B82F6',
      weight: 3,
      opacity: 0.7,
      dashArray: '5, 5',
    }).addTo(map);

    // Fit map to show entire trail
    const bounds = L.latLngBounds(coordinates);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, []);

  // Handle trip selection
  const handleTripSelection = useCallback(
    (tripId: string) => {
      setSelectedTripId(tripId);
      setError(null);
      fetchTripLocation(tripId);
    },
    [fetchTripLocation]
  );

  // Search trips
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setSelectedTripId(null);
      setTripLocationData(null);
      setGpsHistory([]);
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchActiveTrips();
  }, [fetchActiveTrips]);

  // Polling for GPS updates
  useEffect(() => {
    if (!selectedTripId) return;

    // Initial fetch
    fetchTripLocation(selectedTripId);

    // Poll every 10 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchTripLocation(selectedTripId);
    }, 10000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [selectedTripId, fetchTripLocation]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map centered on India
    const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <PageContainer>
      <PageHeader
        Icon={MapPin}
        title="Real-Time GPS Tracking"
        description="Track active vehicle locations in real-time"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
        {/* Left Panel - Trip Selection */}
        <div className="lg:col-span-1 flex flex-col bg-white rounded-lg shadow">
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search trips..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Trips List */}
          <div className="overflow-y-auto flex-1">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 size={24} className="animate-spin text-blue-500" />
              </div>
            )}

            {error && !trips.length && (
              <div className="p-4 flex items-start gap-2 text-amber-700 bg-amber-50">
                <AlertCircle size={16} className="flex-shrink-0 mt-1" />
                <div className="text-sm">{error}</div>
              </div>
            )}

            {trips.map((trip) => (
              <button
                key={trip._id}
                onClick={() => handleTripSelection(trip._id)}
                className={`w-full text-left p-3 border-b transition-colors ${
                  selectedTripId === trip._id
                    ? 'bg-blue-50 border-l-4 border-l-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-sm text-gray-900">
                  {trip.vehicleName}
                </div>
                <div className="text-xs text-gray-500">{trip.licensePlate}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {trip.startLocation} → {trip.endLocation}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Driver: {trip.driverName}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="lg:col-span-2 flex flex-col bg-white rounded-lg shadow">
          {/* Map */}
          <div
            ref={mapContainerRef}
            className="flex-1 rounded-lg"
            style={{ height: '100%', minHeight: '400px' }}
          />

          {/* GPS Info Card */}
          {tripLocationData && (
            <div className="border-t p-4 bg-gray-50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Navigation size={14} className="text-blue-500" />
                  <div>
                    <div className="text-gray-500">Heading</div>
                    <div className="font-semibold text-gray-900">
                      {tripLocationData.location.heading}°
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Gauge size={14} className="text-green-500" />
                  <div>
                    <div className="text-gray-500">Speed</div>
                    <div className="font-semibold text-gray-900">
                      {tripLocationData.location.speed} km/h
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-gray-500">Altitude</div>
                  <div className="font-semibold text-gray-900">
                    {tripLocationData.location.altitude}m
                  </div>
                </div>

                <div>
                  <div className="text-gray-500">Accuracy</div>
                  <div className="font-semibold text-gray-900">
                    ±{tripLocationData.location.accuracy}m
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Updated:{' '}
                {new Date(tripLocationData.location.timestamp).toLocaleTimeString()}
                {isFetchingGPS && (
                  <span className="ml-2 text-blue-500">
                    <Loader2 size={12} className="inline animate-spin" />
                  </span>
                )}
              </div>
            </div>
          )}

          {!selectedTripId && (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                <p>Select a trip to view GPS tracking</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default GPSTracking;
