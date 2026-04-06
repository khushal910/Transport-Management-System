import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNotification } from '../../hooks/useNotification';
import {
  getActiveTrips,
  getTripLatestLocation,
  getTripLocationHistory,
} from '../../api/gpsBaseURL';
import { optimizeGPSPath } from '../../utils/polylineSimplification';
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

    // Remove old polyline completely
    if (polylineRef.current) {
      try {
        map.removeLayer(polylineRef.current);
      } catch (e) {
        console.warn('Could not remove old polyline:', e);
      }
      polylineRef.current = null;
    }

    try {
      // Optimize GPS path - AGGRESSIVE cleanup
      const optimizedPoints = optimizeGPSPath(history);

      console.log(`✓ Optimized: ${history.length} points → ${optimizedPoints.length} points (${Math.round((1 - optimizedPoints.length / history.length) * 100)}% reduction)`);

      if (optimizedPoints.length < 2) {
        console.warn('⚠ Not enough points after optimization');
        return;
      }

      // Create coordinates array
      const coordinates = optimizedPoints.map((loc) => [loc.latitude, loc.longitude]);

      // Draw clean polyline with solid style (no dashes)
      polylineRef.current = L.polyline(coordinates, {
        color: '#06B6D4', // Cyan for clean path
        weight: 4,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Add start/end markers
      L.circleMarker([optimizedPoints[0].latitude, optimizedPoints[0].longitude], {
        radius: 6,
        color: '#10B981', // Green for start
        fill: true,
        fillColor: '#10B981',
        fillOpacity: 0.9,
        weight: 2,
      }).addTo(map).bindPopup('Trip Start');

      L.circleMarker([optimizedPoints[optimizedPoints.length - 1].latitude, optimizedPoints[optimizedPoints.length - 1].longitude], {
        radius: 6,
        color: '#EF4444', // Red for end
        fill: true,
        fillColor: '#EF4444',
        fillOpacity: 0.9,
        weight: 2,
      }).addTo(map).bindPopup('Trip End');

      // Fit map to show entire trail with good padding
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [80, 80] });

      notifySuccess(`Route optimized: ${optimizedPoints.length} key points`);
    } catch (error) {
      console.error('✗ Error updating map with trail:', error);
      notifyError('Error displaying route');
    }
  }, [notifySuccess, notifyError]);

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

      {/* Info Banner */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1" />
        <div className="text-sm text-blue-800">
          <span className="font-semibold">📍 Note:</span> This page shows only <span className="font-semibold">dispatched trips</span> currently in transit. 
          Completed or cancelled trips will not appear on the map.
        </div>
      </div>

      {/* Professional Layout: Map + Sidebar */}
      <div className="flex gap-4 h-[calc(100vh-220px)]">
        {/* Main Map Area - Takes 85% */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-lg overflow-hidden relative">
          {/* Map Container */}
          <div
            ref={mapContainerRef}
            className="flex-1"
            style={{ height: '100%' }}
          />
          
          {/* GPS Info Overlay - Bottom Left Corner */}
          {tripLocationData && (
            <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-xl p-4 max-w-sm border border-gray-200 z-40">
              <div className="mb-3 pb-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin size={16} className="text-blue-600" />
                  {tripLocationData.vehicle.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{tripLocationData.vehicle.licensePlate}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 rounded-lg">
                  <div className="text-xs text-gray-600">Speed</div>
                  <div className="font-bold text-lg text-blue-600 flex items-center gap-1">
                    {tripLocationData.location.speed}
                    <span className="text-xs">km/h</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 rounded-lg">
                  <div className="text-xs text-gray-600">Heading</div>
                  <div className="font-bold text-lg text-green-600 flex items-center gap-1">
                    {tripLocationData.location.heading}
                    <span className="text-xs">°</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-2 rounded-lg">
                  <div className="text-xs text-gray-600">Altitude</div>
                  <div className="font-bold text-lg text-purple-600 flex items-center gap-1">
                    {tripLocationData.location.altitude}
                    <span className="text-xs">m</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-2 rounded-lg">
                  <div className="text-xs text-gray-600">Accuracy</div>
                  <div className="font-bold text-lg text-orange-600 flex items-center gap-1">
                    ±{tripLocationData.location.accuracy}
                    <span className="text-xs">m</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                <span>Updated: {new Date(tripLocationData.location.timestamp).toLocaleTimeString()}</span>
                {isFetchingGPS && (
                  <Loader2 size={14} className="text-blue-500 animate-spin" />
                )}
              </div>
            </div>
          )}

          {!selectedTripId && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent to-gray-900/10 z-30 rounded-xl">
              <div className="text-center bg-white/95 backdrop-blur py-8 px-12 rounded-2xl">
                <MapPin size={48} className="mx-auto mb-3 text-blue-400 opacity-70" />
                <p className="text-lg font-semibold text-gray-700">Select a trip to view GPS tracking</p>
                <p className="text-sm text-gray-500 mt-1">Choose from the list on the right →</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Trip List - Takes 15% */}
        <div className="w-80 flex flex-col bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white">
            <h2 className="font-semibold text-base">Active Trips</h2>
            <p className="text-xs opacity-90 mt-1">{trips.length} trips available</p>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search trips..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Trips List */}
          <div className="overflow-y-auto flex-1">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 size={24} className="animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading trips...</p>
                </div>
              </div>
            )}

            {error && !trips.length && (
              <div className="p-3 flex items-start gap-2 text-amber-700 bg-amber-50 m-2 rounded-lg">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <div className="text-sm">{error}</div>
              </div>
            )}

            {!isLoading && trips.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <MapPin size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active trips</p>
              </div>
            )}

            {trips.map((trip) => (
              <button
                key={trip._id}
                onClick={() => handleTripSelection(trip._id)}
                className={`w-full text-left p-3 border-b transition-all ${
                  selectedTripId === trip._id
                    ? 'bg-blue-50 border-l-4 border-l-blue-600 shadow-md'
                    : 'hover:bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">
                      {trip.vehicleName}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{trip.licensePlate}</div>
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      📍 {trip.startLocation.substring(0, 20)}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      📍 {trip.endLocation.substring(0, 20)}
                    </div>
                  </div>
                  {selectedTripId === trip._id && (
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default GPSTracking;
