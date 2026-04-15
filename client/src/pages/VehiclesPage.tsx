import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Truck, AlertCircle, Check } from 'lucide-react';
import { getVehicleList, createVehicle } from '@/api/vehicle';
import { useAuth } from '@/context/AuthContext';
import type { Vehicle, VehicleType } from '@/types/fleet';
import { cn } from '@/lib/utils';

export default function VehiclesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const canManage = user?.role === 'manager';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const result = await getVehicleList();
      return result.data;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Vehicles</h1>
            <p className="page-description">Manage your fleet vehicles</p>
          </div>
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
                <VehicleForm onClose={() => setDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="filter-bar">
          <div className="relative flex-1 max-w-sm">
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

        <div className="rounded-xl border bg-card overflow-x-auto">
          {isLoading && !vehicles.length ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                Loading vehicles…
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
            <div className="p-8 text-center text-muted-foreground">No vehicles found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">License Plate</th>
                  <th className="px-6 py-3 font-medium">Model</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Capacity</th>
                  <th className="px-6 py-3 font-medium">Odometer</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v._id} className="data-table-row border-b hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-3 font-medium flex items-center gap-2"><Truck className="h-4 w-4 text-muted-foreground" />{v.name}</td>
                    <td className="px-6 py-3 font-mono text-xs">{v.licensePlate}</td>
                    <td className="px-6 py-3">{v.model}</td>
                    <td className="px-6 py-3 capitalize">{v.vehicleType}</td>
                    <td className="px-6 py-3">{v.maxCapacity?.toLocaleString?.() ?? v.maxCapacity} kg</td>
                    <td className="px-6 py-3">{v.odometer?.toLocaleString?.() ?? v.odometer} km</td>
                    <td className="px-6 py-3"><StatusBadge status={v.status} /></td>
                  </tr>
                ))}
                {filtered.length === 0 && vehicles.length > 0 && (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No vehicles match your filters</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function VehicleForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', licensePlate: '', model: '', vehicleType: 'truck' as VehicleType, maxCapacity: '', odometer: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Vehicle name is required';
    if (!form.licensePlate.trim()) newErrors.licensePlate = 'License plate is required';
    if (!form.model.trim()) newErrors.model = 'Model is required';
    if (!form.maxCapacity) newErrors.maxCapacity = 'Max capacity is required';
    else if (isNaN(Number(form.maxCapacity)) || Number(form.maxCapacity) <= 0) newErrors.maxCapacity = 'Must be a positive number';
    if (!form.odometer) newErrors.odometer = 'Odometer is required';
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
      setTimeout(() => onClose(), 1500);
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
          />
          {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
        </div>
        <div className="space-y-2">
          <Label>Vehicle Type</Label>
          <Select value={form.vehicleType} onValueChange={(value) => setForm({ ...form, vehicleType: value as VehicleType })}>
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
          />
          {errors.odometer && <p className="text-xs text-destructive">{errors.odometer}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registering...' : 'Register Vehicle'}
        </Button>
      </div>
    </form>
  );
}
