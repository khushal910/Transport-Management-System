import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getMaintenanceList } from '@/api/maintenance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Wrench, AlertCircle } from 'lucide-react';
import type { MaintenanceLog } from '@/types/fleet';

export default function MaintenancePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['maintenance', statusFilter],
    queryFn: async () => {
      const result = await getMaintenanceList();
      return result.data;
    },
    refetchOnWindowFocus: false,
    retry: 1,
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use API data only - no mock fallback
  const maintenance = useMemo<MaintenanceLog[]>(() => {
    const apiLogs = Array.isArray((data as { logs?: MaintenanceLog[] } | undefined)?.logs)
      ? ((data as { logs?: MaintenanceLog[] }).logs ?? [])
      : Array.isArray((data as { maintenances?: MaintenanceLog[] } | undefined)?.maintenances)
        ? ((data as { maintenances?: MaintenanceLog[] }).maintenances ?? [])
        : [];

    return apiLogs;
  }, [data]);

  const filtered = useMemo(() => {
    return maintenance.filter((m) => {
      const matchSearch = !search || [m.vehicle.name, m.description].some((f) => f.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [maintenance, search, statusFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Maintenance</h1>
            <p className="page-description">Track vehicle maintenance logs</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Log Maintenance</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>Create Maintenance Log</DialogTitle></DialogHeader>
              <MaintenanceForm onClose={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="filter-bar">
          <div className="relative flex-1 max-w-sm">
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
            <div className="col-span-full p-8 text-center text-muted-foreground">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                Loading maintenance logs...
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

function MaintenanceForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ vehicleName: '', description: '', serviceDate: '', cost: '', distance: '' });
  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: e.target.value });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="space-y-4 mt-4">
      <div className="space-y-2"><Label>Vehicle Name</Label><Input placeholder="Truck-001" value={form.vehicleName} onChange={update('vehicleName')} required /></div>
      <div className="space-y-2"><Label>Description</Label><Input placeholder="Engine oil change..." value={form.description} onChange={update('description')} required /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Service Date</Label><Input type="date" value={form.serviceDate} onChange={update('serviceDate')} required /></div>
        <div className="space-y-2"><Label>Cost (₹)</Label><Input type="number" placeholder="5000" value={form.cost} onChange={update('cost')} /></div>
      </div>
      <div className="space-y-2"><Label>Distance (km)</Label><Input type="number" placeholder="150000" value={form.distance} onChange={update('distance')} /></div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Create Log</Button>
      </div>
    </form>
  );
}
