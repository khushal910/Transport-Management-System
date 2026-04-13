import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, ArrowRight, AlertCircle } from 'lucide-react';
import { getTripList } from '@/api/trip';
import { useAuth } from '@/context/AuthContext';
import type { Trip } from '@/types/fleet';

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
      const matchSearch = !search || [t.vehicle.name, t.driver.user.name, t.startLocation, t.endLocation].some((f) => f?.toLowerCase?.().includes(search.toLowerCase()));
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
                <DialogHeader><DialogTitle>Create Trip</DialogTitle></DialogHeader>
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
                      <td className="px-6 py-3 font-medium">{t.vehicle.name}</td>
                      <td className="px-6 py-3">{t.driver.user.name}</td>
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
  const [form, setForm] = useState({ vehiclePlateNumber: '', driverEmail: '', cargoWeight: '', startLocation: '', endLocation: '', revenue: '' });
  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Vehicle Plate Number</Label><Input placeholder="DL-01-AB-1234" value={form.vehiclePlateNumber} onChange={update('vehiclePlateNumber')} required /></div>
        <div className="space-y-2"><Label>Driver Email</Label><Input type="email" placeholder="driver@company.com" value={form.driverEmail} onChange={update('driverEmail')} required /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Start Location</Label><Input placeholder="Delhi" value={form.startLocation} onChange={update('startLocation')} required /></div>
        <div className="space-y-2"><Label>End Location</Label><Input placeholder="Bangalore" value={form.endLocation} onChange={update('endLocation')} required /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Cargo Weight (kg)</Label><Input type="number" placeholder="2500" value={form.cargoWeight} onChange={update('cargoWeight')} required /></div>
        <div className="space-y-2"><Label>Revenue (₹)</Label><Input type="number" placeholder="15000" value={form.revenue} onChange={update('revenue')} required /></div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Create Trip</Button>
      </div>
    </form>
  );
}
