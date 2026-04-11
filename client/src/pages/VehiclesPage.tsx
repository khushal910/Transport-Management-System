import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Truck } from 'lucide-react';
import { getVehicleList } from '@/api/vehicle';
import type { Vehicle, VehicleType } from '@/types/fleet';

export default function VehiclesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery(['vehicles'], async () => {
    const result = await getVehicleList();
    return result.data;
  }, {
    refetchOnWindowFocus: false,
  });

  const vehicles = data?.vehicles ?? [];
  const filtered = vehicles.filter((v) => {
    const matchSearch = !search || [v.name, v.licensePlate, v.model].some((f) => f.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchSearch && matchStatus && !v.isDeleted;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Vehicles</h1>
            <p className="page-description">Manage your fleet vehicles</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Add Vehicle</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>Register Vehicle</DialogTitle></DialogHeader>
              <VehicleForm onClose={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
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
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading vehicles…</div>
          ) : isError ? (
            <div className="p-8 text-center text-red-600">Failed to load vehicles. Please sign in or try again.</div>
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
                  <tr key={v._id} className="data-table-row">
                    <td className="px-6 py-3 font-medium flex items-center gap-2"><Truck className="h-4 w-4 text-muted-foreground" />{v.name}</td>
                    <td className="px-6 py-3 font-mono text-xs">{v.licensePlate}</td>
                    <td className="px-6 py-3">{v.model}</td>
                    <td className="px-6 py-3 capitalize">{v.vehicleType}</td>
                    <td className="px-6 py-3">{v.maxCapacity.toLocaleString()} kg</td>
                    <td className="px-6 py-3">{v.odometer.toLocaleString()} km</td>
                    <td className="px-6 py-3"><StatusBadge status={v.status} /></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No vehicles found</td></tr>
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
  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submit
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Vehicle Name</Label><Input placeholder="Truck-001" value={form.name} onChange={update('name')} required /></div>
        <div className="space-y-2"><Label>License Plate</Label><Input placeholder="DL-01-AB-1234" value={form.licensePlate} onChange={update('licensePlate')} required /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Model</Label><Input placeholder="Tata 1518" value={form.model} onChange={update('model')} required /></div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={form.vehicleType} onValueChange={(v) => setForm({ ...form, vehicleType: v as VehicleType })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="truck">Truck</SelectItem>
              <SelectItem value="van">Van</SelectItem>
              <SelectItem value="bike">Bike</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Max Capacity (kg)</Label><Input type="number" placeholder="5000" value={form.maxCapacity} onChange={update('maxCapacity')} required /></div>
        <div className="space-y-2"><Label>Odometer (km)</Label><Input type="number" placeholder="45000" value={form.odometer} onChange={update('odometer')} required /></div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Register Vehicle</Button>
      </div>
    </form>
  );
}
