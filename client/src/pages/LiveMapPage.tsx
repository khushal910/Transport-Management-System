import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Loader2, MapPinned, Navigation, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  getActiveTripsForTracking,
  getTripLatestLocation,
  getTripLocationHistory,
  type ActiveTripTrackingItem,
} from '@/api/gps';

const LOCATION_REFRESH_INTERVAL_MS = 10_000;
const HISTORY_REFRESH_INTERVAL_MS = 20_000;

const buildDriverMapEmbedUrl = (latitude: number, longitude: number): string => {
  const delta = 0.06;
  const minLon = longitude - delta;
  const minLat = latitude - delta;
  const maxLon = longitude + delta;
  const maxLat = latitude + delta;
  const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${latitude},${longitude}`;
};

const formatTimestamp = (value?: string): string => {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatCoordinate = (value?: number): string => {
  if (typeof value !== 'number') {
    return '-';
  }

  return value.toFixed(6);
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

export default function LiveMapPage() {
  const [tripSearch, setTripSearch] = useState('');
  const [selectedTripId, setSelectedTripId] = useState('');

  const debouncedTripSearch = useDebouncedValue(tripSearch, 350);

  const {
    data: activeTripsData,
    isLoading: isTripsLoading,
    isError: isTripsError,
    error: activeTripsError,
    refetch: refetchActiveTrips,
  } = useQuery({
    queryKey: ['gps-active-trips', debouncedTripSearch],
    queryFn: async () => {
      const result = await getActiveTripsForTracking(debouncedTripSearch);
      return result.data;
    },
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 30_000,
  });

  const activeTrips = useMemo(() => {
    return (activeTripsData?.trips ?? []) as ActiveTripTrackingItem[];
  }, [activeTripsData]);

  const selectedTrip = useMemo(() => {
    return activeTrips.find((trip) => trip._id === selectedTripId) ?? null;
  }, [activeTrips, selectedTripId]);

  useEffect(() => {
    if (!activeTrips.length) {
      setSelectedTripId('');
      return;
    }

    const selectedTripStillAvailable = activeTrips.some((trip) => trip._id === selectedTripId);
    if (!selectedTripId || !selectedTripStillAvailable) {
      setSelectedTripId(activeTrips[0]._id);
    }
  }, [activeTrips, selectedTripId]);

  const {
    data: latestLocationData,
    isLoading: isLatestLoading,
    isError: isLatestError,
    error: latestLocationError,
    refetch: refetchLatestLocation,
    isFetching: isLatestFetching,
  } = useQuery({
    queryKey: ['gps-latest-location', selectedTripId],
    queryFn: async () => {
      const result = await getTripLatestLocation(selectedTripId);
      return result.data;
    },
    enabled: Boolean(selectedTripId),
    retry: 1,
    refetchOnWindowFocus: false,
    refetchInterval: selectedTripId ? LOCATION_REFRESH_INTERVAL_MS : false,
  });

  const {
    data: historyData,
    isFetching: isHistoryFetching,
  } = useQuery({
    queryKey: ['gps-location-history', selectedTripId],
    queryFn: async () => {
      const result = await getTripLocationHistory(selectedTripId, 20);
      return result.data;
    },
    enabled: Boolean(selectedTripId),
    retry: 1,
    refetchOnWindowFocus: false,
    refetchInterval: selectedTripId ? HISTORY_REFRESH_INTERVAL_MS : false,
  });

  const latestLocation = latestLocationData?.location;
  const latestRoute = latestLocationData?.route;
  const latestDriverEmail = latestLocationData?.driver?.email;
  const latestVehicleName = latestLocationData?.vehicle?.name;
  const latestLicensePlate = latestLocationData?.vehicle?.licensePlate;

  const hasValidatedStart = Boolean(selectedTrip?.startLocationDetails?.placeId);
  const hasValidatedEnd = Boolean(selectedTrip?.endLocationDetails?.placeId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Live Map Tracking</h1>
            <p className="page-description">Select a dispatched trip and track the driver live location</p>
          </div>
          <Button type="button" variant="outline" onClick={() => refetchActiveTrips()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Trips
          </Button>
        </div>

        {isTripsLoading ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            <div className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading active trips...
            </div>
          </div>
        ) : isTripsError ? (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium">Failed to load active trips</p>
              <p>{activeTripsError instanceof Error ? activeTripsError.message : 'Please retry.'}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => refetchActiveTrips()}>
                Retry
              </Button>
            </div>
          </div>
        ) : activeTrips.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground space-y-2">
            <MapPinned className="mx-auto h-8 w-8" />
            <p className="font-medium text-foreground">No dispatched trips available</p>
            <p className="text-sm">Create and dispatch a trip first, then it will appear for live tracking.</p>
          </div>
        ) : (
          <>
            <div className="rounded-xl border bg-card p-4 grid gap-4 md:grid-cols-[1fr_1fr]">
              <div className="space-y-2">
                <Label>Search Trip</Label>
                <Input
                  placeholder="Search by vehicle, driver, start or end location"
                  value={tripSearch}
                  onChange={(event) => setTripSearch(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Select Active Trip</Label>
                <Select value={selectedTripId} onValueChange={setSelectedTripId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trip" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTrips.map((trip) => (
                      <SelectItem key={trip._id} value={trip._id}>
                        {(trip.vehicleName || 'Vehicle')} - {(trip.driverName || trip.driverEmail || 'Driver')} - {trip.startLocation || 'Start'} to {trip.endLocation || 'End'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div className="rounded-xl border bg-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Driver Live Position</h2>
                  <span className="text-xs text-muted-foreground">
                    {isLatestFetching ? 'Refreshing...' : `Auto-refresh every ${LOCATION_REFRESH_INTERVAL_MS / 1000}s`}
                  </span>
                </div>

                {isLatestLoading ? (
                  <div className="h-[420px] rounded-md border flex items-center justify-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading live location...
                  </div>
                ) : isLatestError ? (
                  <div className="h-[420px] rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive flex flex-col justify-center items-center gap-3 text-center">
                    <AlertCircle className="h-5 w-5" />
                    <p>{latestLocationError instanceof Error ? latestLocationError.message : 'Failed to load live location.'}</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => refetchLatestLocation()}>
                      Retry Live Location
                    </Button>
                  </div>
                ) : latestLocation ? (
                  <iframe
                    title="Live driver location"
                    src={buildDriverMapEmbedUrl(latestLocation.latitude, latestLocation.longitude)}
                    className="h-[420px] w-full rounded-md border"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-[420px] rounded-md border border-dashed flex items-center justify-center text-muted-foreground text-sm">
                    Live GPS position not available for this trip yet.
                  </div>
                )}
              </div>

              <div className="rounded-xl border bg-card p-4 space-y-4">
                <h2 className="text-lg font-semibold">Tracking Details</h2>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Vehicle</p>
                    <p className="font-medium">{latestVehicleName || selectedTrip?.vehicleName || 'N/A'} ({latestLicensePlate || selectedTrip?.licensePlate || 'N/A'})</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Driver</p>
                    <p className="font-medium">{selectedTrip?.driverName || latestDriverEmail || selectedTrip?.driverEmail || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Route</p>
                    <p className="font-medium">{latestRoute?.startLocation || selectedTrip?.startLocation || 'N/A'} to {latestRoute?.endLocation || selectedTrip?.endLocation || 'N/A'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Latitude</p>
                      <p className="font-medium">{formatCoordinate(latestLocation?.latitude)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Longitude</p>
                      <p className="font-medium">{formatCoordinate(latestLocation?.longitude)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Speed</p>
                      <p className="font-medium">{latestLocation?.speed ?? 0} km/h</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Heading</p>
                      <p className="font-medium">{latestLocation?.heading ?? 0} deg</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Last Update</p>
                    <p className="font-medium">{formatTimestamp(latestLocation?.timestamp)}</p>
                  </div>

                  <div className="rounded-md border bg-muted/20 p-3 space-y-2">
                    <p className="text-xs font-semibold">Route Validation Status</p>
                    <p className={hasValidatedStart ? 'text-xs text-green-700' : 'text-xs text-amber-700'}>
                      Start location: {hasValidatedStart ? 'Validated from suggestion' : 'Legacy trip without validated point'}
                    </p>
                    <p className={hasValidatedEnd ? 'text-xs text-green-700' : 'text-xs text-amber-700'}>
                      End location: {hasValidatedEnd ? 'Validated from suggestion' : 'Legacy trip without validated point'}
                    </p>
                  </div>

                  <div className="rounded-md border bg-muted/20 p-3 text-xs text-muted-foreground flex items-center gap-2">
                    <Navigation className="h-3.5 w-3.5" />
                    {isHistoryFetching
                      ? 'Refreshing route trail...'
                      : `Recent GPS points loaded: ${historyData?.history?.length ?? 0}`}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
