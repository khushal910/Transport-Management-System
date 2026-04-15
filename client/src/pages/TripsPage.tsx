import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Search, ArrowRight, AlertCircle, Check, ChevronsUpDown } from 'lucide-react';
import { getTripList, createTrip } from '@/api/trip';
import { getVehicleList } from '@/api/vehicle';
import { getDriverList } from '@/api/driver';
import { useAuth } from '@/context/AuthContext';
import type { Trip, Vehicle } from '@/types/fleet';
import { cn } from '@/lib/utils';

type DriverOption = {
  _id: string;
  name: string;
  email: string;
};

export default function TripsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const canCreate = user?.role === 'manager' || user?.role === 'dispatcher';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['trips', statusFilter],
    queryFn: async () => {
      const result = await getTripList(statusFilter === 'all' ? undefined : statusFilter);
      return result.data;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Use API data only - no mock fallback
  const trips = useMemo(() => {
    return (data?.trips ?? []) as Trip[];
  }, [data]);

  const filtered = useMemo(() => {
    return trips.filter((t) => {
      const vehicleName = t.vehicle?.name ?? 'Unknown Vehicle';
      const driverName = t.driver?.user?.name ?? 'Unknown Driver';
      const matchSearch = !search || [vehicleName, driverName, t.startLocation, t.endLocation].some((f) => f?.toLowerCase?.().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [trips, search, statusFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Trips</h1>
            <p className="page-description">Manage trip assignments and tracking</p>
          </div>
          {canCreate && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />Create Trip</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Trip</DialogTitle>
                  <DialogDescription className="sr-only">
                    Select vehicle and driver, then provide route and cargo details to create a trip.
                  </DialogDescription>
                </DialogHeader>
                <TripForm onClose={() => setDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="filter-bar">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search trips..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border bg-card overflow-x-auto">
          {isLoading && !trips.length ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                Loading trips…
              </div>
            </div>
          ) : isError ? (
            <div className="p-4 bg-destructive/10 border-b border-destructive/50 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <div>
                <p className="font-medium">Failed to load trips</p>
                <p className="text-xs">{error instanceof Error ? error.message : 'Please try again later'}</p>
              </div>
            </div>
          ) : trips.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No trips found</div>
          ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Vehicle</th>
                    <th className="px-6 py-3 font-medium">Driver</th>
                    <th className="px-6 py-3 font-medium">Route</th>
                    <th className="px-6 py-3 font-medium">Cargo</th>
                    <th className="px-6 py-3 font-medium">Revenue</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t._id} className="data-table-row border-b hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-3 font-medium">{t.vehicle?.name ?? 'Unknown Vehicle'}</td>
                      <td className="px-6 py-3">{t.driver?.user?.name ?? 'Unknown Driver'}</td>
                      <td className="px-6 py-3">
                        <span className="flex items-center gap-1">{t.startLocation} <ArrowRight className="h-3 w-3 text-muted-foreground" /> {t.endLocation}</span>
                      </td>
                      <td className="px-6 py-3">{t.cargoWeight?.toLocaleString?.() ?? t.cargoWeight} kg</td>
                      <td className="px-6 py-3 font-mono">₹{t.revenue?.toLocaleString?.('en-IN') ?? t.revenue}</td>
                      <td className="px-6 py-3"><StatusBadge status={t.status} /></td>
                      <td className="px-6 py-3 text-muted-foreground">{new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && trips.length > 0 && (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No trips match your filters</td></tr>
                  )}
                </tbody>
              </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function TripForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ vehicleId: '', driverId: '', cargoWeight: '', startLocation: '', endLocation: '', revenue: '' });
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [driverOpen, setDriverOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch vehicles
  const { data: vehiclesData, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles-trip-form'],
    queryFn: async () => {
      const result = await getVehicleList(1, 100);
      return result.data?.vehicles ?? [];
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Fetch drivers
  const { data: driversData, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers-trip-form'],
    queryFn: async () => {
      const result = await getDriverList(1, 100);
      return result.data?.drivers ?? [];
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const vehicles = (vehiclesData ?? []) as Vehicle[];
  const drivers = useMemo<DriverOption[]>(() => {
    const rawDrivers = Array.isArray(driversData) ? driversData : [];

    return rawDrivers
      .map((driver) => {
        const item = driver as { _id?: string; name?: string; email?: string; user?: { name?: string; email?: string } };
        const name = item.user?.name ?? item.name ?? '';
        const email = item.user?.email ?? item.email ?? '';

        if (!item._id || !name) {
          return null;
        }

        return {
          _id: item._id,
          name,
          email,
        };
      })
      .filter((driver): driver is DriverOption => Boolean(driver));
  }, [driversData]);

  // Filter vehicles by name or plate
  const filteredVehicles = useMemo(() => {
    if (!vehicleSearch.trim()) return vehicles;
    const search = vehicleSearch.toLowerCase();
    return vehicles.filter((v) => v.name.toLowerCase().includes(search) || v.licensePlate.toLowerCase().includes(search));
  }, [vehicles, vehicleSearch]);

  // Filter drivers by name or email
  const filteredDrivers = useMemo(() => {
    if (!driverSearch.trim()) return drivers;
    const search = driverSearch.toLowerCase();
    return drivers.filter((d) => d.name.toLowerCase().includes(search) || d.email.toLowerCase().includes(search));
  }, [drivers, driverSearch]);

  // Get selected vehicle and driver objects
  const selectedVehicle = vehicles.find((v) => v._id === form.vehicleId);
  const selectedDriver = drivers.find((d) => d._id === form.driverId);

  // Live validation for cargo weight
  const validateCargoWeight = useCallback((weight: string) => {
    const newErrors = { ...errors };
    if (!weight) {
      newErrors.cargoWeight = 'Cargo weight is required';
    } else if (isNaN(Number(weight))) {
      newErrors.cargoWeight = 'Cargo weight must be a number';
    } else if (Number(weight) <= 0) {
      newErrors.cargoWeight = 'Cargo weight must be greater than 0';
    } else if (selectedVehicle && Number(weight) > selectedVehicle.maxCapacity) {
      newErrors.cargoWeight = `Exceeds max capacity: ${selectedVehicle.maxCapacity} kg`;
    } else {
      delete newErrors.cargoWeight;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [errors, selectedVehicle]);

  const handleCargoWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm({ ...form, cargoWeight: value });
    validateCargoWeight(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    if (!form.vehicleId) newErrors.vehicleId = 'Vehicle is required';
    if (!form.driverId) newErrors.driverId = 'Driver is required';
    if (!form.startLocation.trim()) newErrors.startLocation = 'Start location is required';
    if (!form.endLocation.trim()) newErrors.endLocation = 'End location is required';
    if (!form.cargoWeight) newErrors.cargoWeight = 'Cargo weight is required';
    if (!form.revenue) newErrors.revenue = 'Revenue is required';
    if (Number(form.revenue) <= 0) newErrors.revenue = 'Revenue must be greater than 0';
    if (selectedVehicle && Number(form.cargoWeight) > selectedVehicle.maxCapacity) {
      newErrors.cargoWeight = `Exceeds max capacity: ${selectedVehicle.maxCapacity} kg`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);
    try {
      if (!selectedVehicle || !selectedDriver) {
        setSubmitMessage({ type: 'error', text: 'Please select a valid vehicle and driver' });
        setIsSubmitting(false);
        return;
      }

      if (!selectedDriver.email) {
        setSubmitMessage({ type: 'error', text: 'Selected driver does not have a valid email' });
        setIsSubmitting(false);
        return;
      }

      await createTrip({
        vehiclePlateNumber: selectedVehicle.licensePlate,
        driverEmail: selectedDriver.email,
        cargoWeight: Number(form.cargoWeight),
        startLocation: form.startLocation.trim(),
        endLocation: form.endLocation.trim(),
        revenue: Number(form.revenue),
      });

      setSubmitMessage({ type: 'success', text: 'Trip created successfully' });
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setSubmitMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to create trip' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 max-h-[70vh] min-w-0 overflow-y-auto">
      {submitMessage && (
        <div className={cn('p-3 rounded-md flex items-center gap-2 text-sm', submitMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-destructive/10 text-destructive')}>
          {submitMessage.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {submitMessage.text}
        </div>
      )}

      {/* Vehicle Search */}
      <div className="space-y-2">
        <Label>Vehicle (Name or Plate)</Label>
        <Popover open={vehicleOpen} onOpenChange={setVehicleOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" role="combobox" className={cn('w-full justify-between', errors.vehicleId && 'border-destructive')}>
              {selectedVehicle ? `${selectedVehicle.name} (${selectedVehicle.licensePlate})` : 'Select vehicle...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <div className="p-2">
              <Input placeholder="Search by name or plate..." value={vehicleSearch} onChange={(e) => setVehicleSearch(e.target.value)} className="mb-2" />
              <div className="max-h-48 overflow-y-auto">
                {vehiclesLoading ? (
                  <div className="px-2 py-8 text-center text-sm text-muted-foreground">Loading vehicles...</div>
                ) : filteredVehicles.length === 0 ? (
                  <div className="px-2 py-8 text-center text-sm text-muted-foreground">No vehicles found</div>
                ) : (
                  filteredVehicles.map((v) => (
                    <Button
                      type="button"
                      key={v._id}
                      variant="ghost"
                      className="w-full justify-start mb-1 font-normal"
                      onClick={() => {
                        setForm({ ...form, vehicleId: v._id });
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.vehicleId;
                          return next;
                        });
                        setVehicleOpen(false);
                      }}
                    >
                      <Check className={cn('mr-2 h-4 w-4', form.vehicleId === v._id ? 'opacity-100' : 'opacity-0')} />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{v.name}</div>
                        <div className="text-xs text-muted-foreground">{v.licensePlate} • {v.maxCapacity} kg</div>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {errors.vehicleId && <p className="text-xs text-destructive">{errors.vehicleId}</p>}
        {selectedVehicle && <p className="text-xs text-muted-foreground">Max capacity: {selectedVehicle.maxCapacity} kg</p>}
      </div>

      {/* Driver Search */}
      <div className="space-y-2">
        <Label>Driver (Name or Email)</Label>
        <Popover open={driverOpen} onOpenChange={setDriverOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" role="combobox" className={cn('w-full justify-between', errors.driverId && 'border-destructive')}>
              {selectedDriver ? `${selectedDriver.name}${selectedDriver.email ? ` (${selectedDriver.email})` : ''}` : 'Select driver...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <div className="p-2">
              <Input placeholder="Search by name or email..." value={driverSearch} onChange={(e) => setDriverSearch(e.target.value)} className="mb-2" />
              <div className="max-h-48 overflow-y-auto">
                {driversLoading ? (
                  <div className="px-2 py-8 text-center text-sm text-muted-foreground">Loading drivers...</div>
                ) : filteredDrivers.length === 0 ? (
                  <div className="px-2 py-8 text-center text-sm text-muted-foreground">No drivers found</div>
                ) : (
                  filteredDrivers.map((d) => (
                    <Button
                      type="button"
                      key={d._id}
                      variant="ghost"
                      className="w-full justify-start mb-1 font-normal"
                      onClick={() => {
                        setForm({ ...form, driverId: d._id });
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.driverId;
                          return next;
                        });
                        setDriverOpen(false);
                      }}
                    >
                      <Check className={cn('mr-2 h-4 w-4', form.driverId === d._id ? 'opacity-100' : 'opacity-0')} />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{d.name}</div>
                        <div className="text-xs text-muted-foreground">{d.email || 'No email'}</div>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {errors.driverId && <p className="text-xs text-destructive">{errors.driverId}</p>}
      </div>

      {/* Locations */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Start Location</Label>
          <Input placeholder="e.g., Delhi" value={form.startLocation} onChange={(e) => setForm({ ...form, startLocation: e.target.value })} className={errors.startLocation ? 'border-destructive' : ''} />
          {errors.startLocation && <p className="text-xs text-destructive">{errors.startLocation}</p>}
        </div>
        <div className="space-y-2">
          <Label>End Location</Label>
          <Input placeholder="e.g., Bangalore" value={form.endLocation} onChange={(e) => setForm({ ...form, endLocation: e.target.value })} className={errors.endLocation ? 'border-destructive' : ''} />
          {errors.endLocation && <p className="text-xs text-destructive">{errors.endLocation}</p>}
        </div>
      </div>

      {/* Cargo Weight with Live Validation */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Cargo Weight (kg) {errors.cargoWeight && <span className="text-destructive">*</span>}</Label>
          <Input type="number" placeholder="e.g., 2500" value={form.cargoWeight} onChange={handleCargoWeightChange} className={cn('transition-colors', errors.cargoWeight && 'border-destructive bg-destructive/5')} disabled={!selectedVehicle} />
          {errors.cargoWeight ? (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.cargoWeight}
            </p>
          ) : selectedVehicle && form.cargoWeight && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <Check className="h-3 w-3" /> Weight valid
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Revenue (₹)</Label>
          <Input type="number" placeholder="e.g., 15000" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })} className={errors.revenue ? 'border-destructive' : ''} />
          {errors.revenue && <p className="text-xs text-destructive">{errors.revenue}</p>}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !form.vehicleId || !form.driverId}>
          {isSubmitting ? 'Creating...' : 'Create Trip'}
        </Button>
      </div>
    </form>
  );
}
