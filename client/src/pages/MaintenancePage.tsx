import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getMaintenanceList, createMaintenance } from '@/api/maintenance';
import { getVehicleList } from '@/api/vehicle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Search, Wrench, AlertCircle, Check, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { MaintenanceLog, Vehicle } from '@/types/fleet';
import { cn } from '@/lib/utils';

export default function MaintenancePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canCreate = user?.role === 'manager' || user?.role === 'dispatcher';

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['maintenance', statusFilter],
    queryFn: async () => {
      const result = await getMaintenanceList();
      return result.data;
    },
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Use API data only - no mock fallback
  const maintenance = useMemo<MaintenanceLog[]>(() => {
    const logs = (data as { logs?: MaintenanceLog[] | Record<string, MaintenanceLog[]> } | undefined)?.logs;

    if (Array.isArray(logs)) {
      return logs;
    }

    if (logs && typeof logs === 'object') {
      return Object.values(logs).flat();
    }

    return [];
  }, [data]);

  const filtered = useMemo(() => {
    return maintenance.filter((m) => {
      const matchSearch = !search || [m.vehicle.name, m.description].some((f) => f.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [maintenance, search, statusFilter]);

  const handleMaintenanceCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
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
            <h1 className="page-title">Maintenance</h1>
            <p className="page-description">Track vehicle maintenance logs</p>
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
            {canCreate && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" />Log Maintenance</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Maintenance Log</DialogTitle>
                    <DialogDescription className="sr-only">
                      Search and select a vehicle, then enter maintenance details to log a service record.
                    </DialogDescription>
                  </DialogHeader>
                  <MaintenanceForm
                    onClose={() => setDialogOpen(false)}
                    onCreated={handleMaintenanceCreated}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="filter-bar flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search maintenance..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && maintenance.length === 0 ? (
            <div className="col-span-full space-y-4">
              <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Loading maintenance logs...</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-44 w-full animate-pulse bg-muted/60 rounded-xl" />
                ))}
              </div>
            </div>
          ) : isError ? (
            <div className="col-span-full p-4 bg-destructive/10 border border-destructive/50 rounded-lg text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <div>
                <p className="font-medium">Failed to load maintenance logs</p>
                <p className="text-xs">{error instanceof Error ? error.message : 'Please try again later'}</p>
              </div>
            </div>
          ) : maintenance.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">No maintenance logs found</div>
          ) : (
            <>
              {filtered.map((m) => (
                <div key={m._id} className="rounded-xl border bg-card p-5 card-hover">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-warning/10 p-2"><Wrench className="h-4 w-4 text-warning" /></div>
                      <div>
                        <p className="font-semibold">{m.vehicle.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{m.vehicle.licensePlate}</p>
                      </div>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{m.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Cost</p>
                      <p className="font-semibold font-mono">₹{m.cost.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Service Date</p>
                      <p className="font-medium">{new Date(m.serviceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && maintenance.length > 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground">No maintenance logs match your filters</div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function MaintenanceForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ vehicleId: '', description: '', serviceDate: '', cost: '', distance: '' });
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: vehiclesData, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles-maintenance-form'],
    queryFn: async () => {
      const result = await getVehicleList(1, 100);
      return result.data?.vehicles ?? [];
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const vehicles = (vehiclesData ?? []) as Vehicle[];
  const filteredVehicles = useMemo(() => {
    if (!vehicleSearch.trim()) {
      return vehicles;
    }

    const term = vehicleSearch.toLowerCase();
    return vehicles.filter((vehicle) => {
      return vehicle.name.toLowerCase().includes(term) || vehicle.licensePlate.toLowerCase().includes(term);
    });
  }, [vehicles, vehicleSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let resolvedVehicleId = form.vehicleId;
    if (!resolvedVehicleId && vehicleSearch.trim()) {
      const query = vehicleSearch.trim().toLowerCase();
      const exactMatches = vehicles.filter((vehicle) => {
        return vehicle.name.toLowerCase() === query || vehicle.licensePlate.toLowerCase() === query;
      });

      if (exactMatches.length === 1) {
        resolvedVehicleId = exactMatches[0]._id;
      } else {
        const partialMatches = vehicles.filter((vehicle) => {
          return vehicle.name.toLowerCase().includes(query) || vehicle.licensePlate.toLowerCase().includes(query);
        });

        if (partialMatches.length === 1) {
          resolvedVehicleId = partialMatches[0]._id;
        }
      }
    }

    const resolvedVehicle = vehicles.find((vehicle) => vehicle._id === resolvedVehicleId);

    const newErrors: Record<string, string> = {};
    const selectedDate = form.serviceDate ? new Date(form.serviceDate) : null;
    const now = new Date();

    if (!resolvedVehicleId) {
      newErrors.vehicleId = 'Type vehicle name/plate and select a valid vehicle';
    }
    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (form.description.trim().length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }
    if (!form.serviceDate) {
      newErrors.serviceDate = 'Service date is required';
    } else if (selectedDate && selectedDate < new Date(now.toDateString())) {
      newErrors.serviceDate = 'Service date cannot be in the past';
    }
    if (!form.cost) {
      newErrors.cost = 'Cost is required';
    } else if (Number(form.cost) < 0 || Number.isNaN(Number(form.cost))) {
      newErrors.cost = 'Cost must be a valid non-negative number';
    }
    if (form.distance && (Number(form.distance) < 0 || Number.isNaN(Number(form.distance)))) {
      newErrors.distance = 'Distance must be a valid non-negative number';
    }
    if (resolvedVehicle && resolvedVehicle.status !== 'available') {
      newErrors.vehicleId = `Selected vehicle is ${resolvedVehicle.status}. Choose an available vehicle.`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const serviceDate = new Date(form.serviceDate);
      if (serviceDate.toDateString() === now.toDateString()) {
        serviceDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      } else {
        serviceDate.setHours(9, 0, 0, 0);
      }

      await createMaintenance({
        vehicleId: resolvedVehicleId,
        description: form.description.trim(),
        serviceDate: serviceDate.toISOString(),
        cost: Number(form.cost),
        distance: form.distance ? Number(form.distance) : 0,
      });

      setSubmitMessage({ type: 'success', text: 'Maintenance log created successfully' });
      onCreated();
      setTimeout(() => onClose(), 1200);
    } catch (error) {
      setSubmitMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to create maintenance log' });
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

      <div className="space-y-2">
        <Label>Vehicle (Name or Plate)</Label>
        <Popover open={vehicleOpen} onOpenChange={setVehicleOpen}>
          <PopoverTrigger asChild>
            <Input
              placeholder="Type vehicle name or plate number..."
              value={vehicleSearch}
              onFocus={() => setVehicleOpen(true)}
              onChange={(e) => {
                setVehicleSearch(e.target.value);
                setVehicleOpen(true);
                setForm((prev) => ({ ...prev, vehicleId: '' }));
                if (errors.vehicleId) {
                  setErrors((prev) => ({ ...prev, vehicleId: '' }));
                }
              }}
              className={errors.vehicleId ? 'border-destructive' : ''}
            />
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <div className="max-h-56 overflow-y-auto p-2">
              {vehiclesLoading ? (
                <div className="px-2 py-8 text-center text-sm text-muted-foreground">Loading vehicles...</div>
              ) : filteredVehicles.length === 0 ? (
                <div className="px-2 py-8 text-center text-sm text-muted-foreground">No vehicles found</div>
              ) : (
                filteredVehicles.map((vehicle) => {
                  const unavailable = vehicle.status !== 'available';

                  return (
                    <Button
                      type="button"
                      key={vehicle._id}
                      variant="ghost"
                      disabled={unavailable}
                      className="w-full justify-start mb-1 font-normal"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, vehicleId: vehicle._id }));
                        setVehicleSearch(`${vehicle.name} (${vehicle.licensePlate})`);
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.vehicleId;
                          return next;
                        });
                        setVehicleOpen(false);
                      }}
                    >
                      <Check className={cn('mr-2 h-4 w-4', form.vehicleId === vehicle._id ? 'opacity-100' : 'opacity-0')} />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{vehicle.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {vehicle.licensePlate} • {vehicle.status.replace('_', ' ')}
                        </div>
                      </div>
                    </Button>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>
        {errors.vehicleId && <p className="text-xs text-destructive">{errors.vehicleId}</p>}
        <p className="text-xs text-muted-foreground">Type to search by vehicle name or plate, then pick a result.</p>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          placeholder="e.g., Engine oil change and inspection"
          value={form.description}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, description: e.target.value }));
            if (errors.description) {
              setErrors((prev) => ({ ...prev, description: '' }));
            }
          }}
          className={errors.description ? 'border-destructive' : ''}
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Service Date</Label>
          <Input
            type="date"
            value={form.serviceDate}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, serviceDate: e.target.value }));
              if (errors.serviceDate) {
                setErrors((prev) => ({ ...prev, serviceDate: '' }));
              }
            }}
            className={errors.serviceDate ? 'border-destructive' : ''}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.serviceDate && <p className="text-xs text-destructive">{errors.serviceDate}</p>}
        </div>
        <div className="space-y-2">
          <Label>Cost (₹)</Label>
          <Input
            type="number"
            placeholder="e.g., 5000"
            value={form.cost}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, cost: e.target.value }));
              if (errors.cost) {
                setErrors((prev) => ({ ...prev, cost: '' }));
              }
            }}
            className={errors.cost ? 'border-destructive' : ''}
          />
          {errors.cost && <p className="text-xs text-destructive">{errors.cost}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Distance (km)</Label>
        <Input
          type="number"
          placeholder="e.g., 150000"
          value={form.distance}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, distance: e.target.value }));
            if (errors.distance) {
              setErrors((prev) => ({ ...prev, distance: '' }));
            }
          }}
          className={errors.distance ? 'border-destructive' : ''}
        />
        {errors.distance && <p className="text-xs text-destructive">{errors.distance}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Log'
          )}
        </Button>
      </div>
    </form>
  );
}
