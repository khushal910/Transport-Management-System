import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockExpenses } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';

export default function ExpensesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = mockExpenses.filter((e) => {
    const matchSearch = !search || [e.vehicle.name, e.driver.user.name, e.trip.startLocation, e.trip.endLocation].some((f) => f.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Expenses</h1>
            <p className="page-description">Track fuel and miscellaneous trip expenses</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Add Expense</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>Create Expense</DialogTitle></DialogHeader>
              <ExpenseForm onClose={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="filter-bar">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search expenses..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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

        <div className="rounded-xl border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-6 py-3 font-medium">Trip Route</th>
                <th className="px-6 py-3 font-medium">Driver</th>
                <th className="px-6 py-3 font-medium">Vehicle</th>
                <th className="px-6 py-3 font-medium">Fuel Cost</th>
                <th className="px-6 py-3 font-medium">Misc</th>
                <th className="px-6 py-3 font-medium">Distance</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e._id} className="data-table-row">
                  <td className="px-6 py-3 font-medium">{e.trip.startLocation} → {e.trip.endLocation}</td>
                  <td className="px-6 py-3">{e.driver.user.name}</td>
                  <td className="px-6 py-3">{e.vehicle.name}</td>
                  <td className="px-6 py-3 font-mono">₹{e.fuelCost.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-3 font-mono">₹{e.miscExpense.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-3">{e.distance} km</td>
                  <td className="px-6 py-3"><StatusBadge status={e.status} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No expenses found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ExpenseForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ tripId: '', fuelCost: '', miscExpense: '', distance: '' });
  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: e.target.value });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="space-y-4 mt-4">
      <div className="space-y-2"><Label>Trip ID</Label><Input placeholder="trip_id_123" value={form.tripId} onChange={update('tripId')} required /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Fuel Cost (₹)</Label><Input type="number" placeholder="2500" value={form.fuelCost} onChange={update('fuelCost')} required /></div>
        <div className="space-y-2"><Label>Misc Expense (₹)</Label><Input type="number" placeholder="500" value={form.miscExpense} onChange={update('miscExpense')} /></div>
      </div>
      <div className="space-y-2"><Label>Distance (km)</Label><Input type="number" placeholder="850" value={form.distance} onChange={update('distance')} /></div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Create Expense</Button>
      </div>
    </form>
  );
}
