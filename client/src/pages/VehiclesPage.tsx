import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Truck, AlertCircle, Check, Loader2, RefreshCw, Pencil, Info } from 'lucide-react';
import { getVehicleList, createVehicle, updateVehicle } from '@/api/vehicle';
import { useAuth } from '@/context/AuthContext';
import type { Vehicle, VehicleType } from '@/types/fleet';
import { cn } from '@/lib/utils';

export default function VehiclesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canManage = user?.role === 'manager';

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const result = await getVehicleList(1, 100);
      return result.data;
    },
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  // Use API data only - no mock fallback
  const vehicles = useMemo<Vehicle[]>(() => {
    const apiVehicles = Array.isArray(data)
      ? data
      : Array.isArray((data as { vehicles?: Vehicle[] } | undefined)?.vehicles)
        ? ((data as { vehicles?: Vehicle[] }).vehicles ?? [])
        : [];

    return apiVehicles as Vehicle[];
  }, [data]);

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (v.isDeleted) return false;
      const matchSearch = !search || [v.name, v.licensePlate, v.model].some((f) => f?.toLowerCase?.().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || v.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [vehicles, search, statusFilter]);

  const handleVehicleUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    queryClient.invalidateQueries({ queryKey: ['vehicles-trip-form'] });
    queryClient.invalidateQueries({ queryKey: ['vehicles-maintenance-form'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Vehicles</h1>
            <p className="page-description">Manage and edit your fleet vehicles</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </Button>
            {canManage && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" />Add Vehicle</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Register Vehicle</DialogTitle>
                    <DialogDescription className="sr-only">
                      Enter vehicle details including plate, model, type, and capacity to register a new fleet vehicle.
                    </DialogDescription>
                  </DialogHeader>
                  <VehicleForm
                    onClose={() => setDialogOpen(false)}
                    onCreated={handleVehicleUpdated}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Edit Vehicle Dialog */}
        {editingVehicle && (
          <Dialog open={Boolean(editingVehicle)} onOpenChange={(open) => !open && setEditingVehicle(null)}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Vehicle - {editingVehicle.name}</DialogTitle>
                <DialogDescription className="sr-only">
                  Update vehicle details such as name, license plate, model, vehicle type, max capacity, and odometer.
                </DialogDescription>
              </DialogHeader>
              <EditVehicleForm
                vehicle={editingVehicle}
                onClose={() => setEditingVehicle(null)}
                onUpdated={handleVehicleUpdated}
              />
            </DialogContent>
          </Dialog>
        )}

        <div className="filter-bar flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search vehicles..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="on_trip">On Trip</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_shop">In Shop</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border bg-card overflow-x-auto relative">
          {isLoading && !vehicles.length ? (
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Loading fleet vehicles...</span>
              </div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 w-full animate-pulse bg-muted/60 rounded-md" />
                ))}
              </div>
            </div>
          ) : isError ? (
            <div className="p-4 bg-destructive/10 border-b border-destructive/50 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <div>
                <p className="font-medium">Failed to load vehicles</p>
                <p className="text-xs">{error instanceof Error ? error.message : 'Please try again later'}</p>
              </div>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Truck className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="font-medium">No vehicles found</p>
              <p className="text-xs mt-1">Register a vehicle to start tracking your fleet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground bg-muted/20">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">License Plate</th>
                  <th className="px-6 py-3 font-medium">Model</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Capacity</th>
                  <th className="px-6 py-3 font-medium">Odometer</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  {canManage && <th className="px-6 py-3 font-medium text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => {
                  const isEditable = v.status === 'available' || v.status === 'retired';

                  return (
                    <tr key={v._id} className="data-table-row border-b hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-3 font-medium flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        {v.name}
                      </td>
                      <td className="px-6 py-3 font-mono text-xs">{v.licensePlate}</td>
                      <td className="px-6 py-3">{v.model}</td>
                      <td className="px-6 py-3 capitalize">{v.vehicleType}</td>
                      <td className="px-6 py-3">{v.maxCapacity?.toLocaleString?.() ?? v.maxCapacity} kg</td>
                      <td className="px-6 py-3">{v.odometer?.toLocaleString?.() ?? v.odometer} km</td>
                      <td className="px-6 py-3"><StatusBadge status={v.status} /></td>
                      {canManage && (
                        <td className="px-6 py-3 text-right">
                          {isEditable ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingVehicle(v)}
                              className="h-8 gap-1.5 text-xs hover:border-primary hover:text-primary"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              title={`Cannot edit while ${v.status.replace('_', ' ')}`}
                              className="h-8 gap-1.5 text-xs opacity-50 cursor-not-allowed"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
                {filtered.length === 0 && vehicles.length > 0 && (
                  <tr><td colSpan={canManage ? 8 : 7} className="px-6 py-12 text-center text-muted-foreground">No vehicles match your filters</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function VehicleForm({ onClose, onCreated }: { onClose: () => void; onCreated?: () => void }) {
  const [form, setForm] = useState({ name: '', licensePlate: '', model: '', vehicleType: 'truck' as VehicleType, maxCapacity: '', odometer: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Vehicle name is required';
    if (!form.licensePlate.trim()) newErrors.licensePlate = 'License plate is required';
    if (!form.model.trim()) newErrors.model = 'Model is required';
    if (!form.maxCapacity) newErrors.maxCapacity = 'Max capacity is required';
    else if (isNaN(Number(form.maxCapacity)) || Number(form.maxCapacity) <= 0) newErrors.maxCapacity = 'Must be a positive number';
    if (!form.odometer && form.odometer !== '0') newErrors.odometer = 'Odometer is required';
    else if (isNaN(Number(form.odometer)) || Number(form.odometer) < 0) newErrors.odometer = 'Must be a valid number';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);
    try {
      await createVehicle({
        name: form.name.trim(),
        licensePlate: form.licensePlate.trim(),
        model: form.model.trim(),
        vehicleType: form.vehicleType,
        maxCapacity: Number(form.maxCapacity),
        odometer: Number(form.odometer),
      });

      setSubmitMessage({ type: 'success', text: 'Vehicle registered successfully' });

      // Invalidate queries immediately so the list updates without manual refresh
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      await queryClient.invalidateQueries({ queryKey: ['vehicles-trip-form'] });
      await queryClient.invalidateQueries({ queryKey: ['vehicles-maintenance-form'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics'] });

      if (onCreated) {
        onCreated();
      }

      setTimeout(() => onClose(), 800);
    } catch (error) {
      setSubmitMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to register vehicle' });
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Vehicle Name</Label>
          <Input
            placeholder="e.g., Truck-001"
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            className={errors.name ? 'border-destructive' : ''}
            disabled={isSubmitting}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label>License Plate</Label>
          <Input
            placeholder="e.g., DL-01-AB-1234"
            value={form.licensePlate}
            onChange={(e) => {
              setForm({ ...form, licensePlate: e.target.value });
              if (errors.licensePlate) setErrors({ ...errors, licensePlate: '' });
            }}
            className={errors.licensePlate ? 'border-destructive' : ''}
            disabled={isSubmitting}
          />
          {errors.licensePlate && <p className="text-xs text-destructive">{errors.licensePlate}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Model</Label>
          <Input
            placeholder="e.g., Tata 1518"
            value={form.model}
            onChange={(e) => {
              setForm({ ...form, model: e.target.value });
              if (errors.model) setErrors({ ...errors, model: '' });
            }}
            className={errors.model ? 'border-destructive' : ''}
            disabled={isSubmitting}
          />
          {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
        </div>
        <div className="space-y-2">
          <Label>Vehicle Type</Label>
          <Select
            value={form.vehicleType}
            onValueChange={(value) => setForm({ ...form, vehicleType: value as VehicleType })}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="truck">Truck</SelectItem>
              <SelectItem value="van">Van</SelectItem>
              <SelectItem value="bike">Bike</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Max Capacity (kg)</Label>
          <Input
            type="number"
            placeholder="e.g., 5000"
            value={form.maxCapacity}
            onChange={(e) => {
              setForm({ ...form, maxCapacity: e.target.value });
              if (errors.maxCapacity) setErrors({ ...errors, maxCapacity: '' });
            }}
            className={errors.maxCapacity ? 'border-destructive' : ''}
            disabled={isSubmitting}
          />
          {errors.maxCapacity && <p className="text-xs text-destructive">{errors.maxCapacity}</p>}
        </div>
        <div className="space-y-2">
          <Label>Odometer (km)</Label>
          <Input
            type="number"
            placeholder="e.g., 0"
            value={form.odometer}
            onChange={(e) => {
              setForm({ ...form, odometer: e.target.value });
              if (errors.odometer) setErrors({ ...errors, odometer: '' });
            }}
            className={errors.odometer ? 'border-destructive' : ''}
            disabled={isSubmitting}
          />
          {errors.odometer && <p className="text-xs text-destructive">{errors.odometer}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            'Register Vehicle'
          )}
        </Button>
      </div>
    </form>
  );
}

function EditVehicleForm({
  vehicle,
  onClose,
  onUpdated,
}: {
  vehicle: Vehicle;
  onClose: () => void;
  onUpdated?: () => void;
}) {
  const [form, setForm] = useState({
    name: vehicle.name ?? '',
    licensePlate: vehicle.licensePlate ?? '',
    model: vehicle.model ?? '',
    vehicleType: (vehicle.vehicleType ?? 'truck') as VehicleType,
    maxCapacity: String(vehicle.maxCapacity ?? ''),
    odometer: String(vehicle.odometer ?? ''),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const queryClient = useQueryClient();

  const isEditable = vehicle.status === 'available' || vehicle.status === 'retired';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditable) {
      setSubmitMessage({
        type: 'error',
        text: `Cannot edit vehicle in '${vehicle.status}' status. Only 'available' or 'retired' vehicles can be edited.`,
      });
      return;
    }

    // Validate all fields
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Vehicle name is required';
    if (!form.licensePlate.trim()) newErrors.licensePlate = 'License plate is required';
    if (!form.model.trim()) newErrors.model = 'Model is required';
    if (!form.maxCapacity) newErrors.maxCapacity = 'Max capacity is required';
    else if (isNaN(Number(form.maxCapacity)) || Number(form.maxCapacity) <= 0) {
      newErrors.maxCapacity = 'Must be a positive number';
    }
    if (!form.odometer && form.odometer !== '0') {
      newErrors.odometer = 'Odometer is required';
    } else if (isNaN(Number(form.odometer)) || Number(form.odometer) < 0) {
      newErrors.odometer = 'Must be a valid non-negative number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);
    try {
      await updateVehicle(vehicle._id, {
        name: form.name.trim(),
        licensePlate: form.licensePlate.trim(),
        model: form.model.trim(),
        vehicleType: form.vehicleType,
        maxCapacity: Number(form.maxCapacity),
        odometer: Number(form.odometer),
      });

      setSubmitMessage({ type: 'success', text: 'Vehicle updated successfully' });

      // Invalidate queries immediately so the list updates without manual refresh
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      await queryClient.invalidateQueries({ queryKey: ['vehicles-trip-form'] });
      await queryClient.invalidateQueries({ queryKey: ['vehicles-maintenance-form'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics'] });

      if (onUpdated) {
        onUpdated();
      }

      setTimeout(() => onClose(), 800);
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update vehicle',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 max-h-[70vh] min-w-0 overflow-y-auto">
      {submitMessage && (
        <div
          className={cn(
            'p-3 rounded-md flex items-center gap-2 text-sm',
            submitMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-destructive/10 text-destructive'
          )}
        >
          {submitMessage.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {submitMessage.text}
        </div>
      )}

      <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">Current Status:</span>
          <StatusBadge status={vehicle.status} />
        </div>
        <p className="text-muted-foreground flex items-center gap-1 mt-1">
          <Info className="h-3.5 w-3.5" />
          Vehicle status is managed automatically via trips & maintenance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Vehicle Name</Label>
          <Input
            placeholder="e.g., Truck-001"
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            className={errors.name ? 'border-destructive' : ''}
            disabled={isSubmitting}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label>License Plate</Label>
          <Input
            placeholder="e.g., DL-01-AB-1234"
            value={form.licensePlate}
            onChange={(e) => {
              setForm({ ...form, licensePlate: e.target.value });
              if (errors.licensePlate) setErrors({ ...errors, licensePlate: '' });
            }}
            className={errors.licensePlate ? 'border-destructive' : ''}
            disabled={isSubmitting}
          />
          {errors.licensePlate && <p className="text-xs text-destructive">{errors.licensePlate}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Model</Label>
          <Input
            placeholder="e.g., Tata 1518"
            value={form.model}
            onChange={(e) => {
              setForm({ ...form, model: e.target.value });
              if (errors.model) setErrors({ ...errors, model: '' });
            }}
            className={errors.model ? 'border-destructive' : ''}
            disabled={isSubmitting}
          />
          {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
        </div>
        <div className="space-y-2">
          <Label>Vehicle Type</Label>
          <Select
            value={form.vehicleType}
            onValueChange={(value) => setForm({ ...form, vehicleType: value as VehicleType })}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="truck">Truck</SelectItem>
              <SelectItem value="van">Van</SelectItem>
              <SelectItem value="bike">Bike</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Max Capacity (kg)</Label>
          <Input
            type="number"
            placeholder="e.g., 5000"
            value={form.maxCapacity}
            onChange={(e) => {
              setForm({ ...form, maxCapacity: e.target.value });
              if (errors.maxCapacity) setErrors({ ...errors, maxCapacity: '' });
            }}
            className={errors.maxCapacity ? 'border-destructive' : ''}
            disabled={isSubmitting}
          />
          {errors.maxCapacity && <p className="text-xs text-destructive">{errors.maxCapacity}</p>}
        </div>
        <div className="space-y-2">
          <Label>Odometer (km)</Label>
          <Input
            type="number"
            placeholder="e.g., 0"
            value={form.odometer}
            onChange={(e) => {
              setForm({ ...form, odometer: e.target.value });
              if (errors.odometer) setErrors({ ...errors, odometer: '' });
            }}
            className={errors.odometer ? 'border-destructive' : ''}
            disabled={isSubmitting}
          />
          {errors.odometer && <p className="text-xs text-destructive">{errors.odometer}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}


