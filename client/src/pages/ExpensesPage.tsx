import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getExpenseList } from '@/api/expense';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, AlertCircle } from 'lucide-react';
import type { Expense } from '@/types/fleet';

type ExpenseRow = Partial<Expense> & {
  _id: string;
  driverName?: string;
  vehicleName?: string;
  startLocation?: string;
  endLocation?: string;
  plateNumber?: string;
};

export default function ExpensesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['expenses', statusFilter],
    queryFn: async () => {
      const result = await getExpenseList();
      return result.data;
    },
    refetchOnWindowFocus: false,
    retry: 1,
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use API data only - no mock fallback
  const expenses = useMemo<ExpenseRow[]>(() => {
    const apiExpenses = Array.isArray((data as { expenses?: ExpenseRow[] } | undefined)?.expenses)
      ? ((data as { expenses?: ExpenseRow[] }).expenses ?? [])
      : [];

    return apiExpenses;
  }, [data]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const vehicleName = e.vehicle?.name ?? e.vehicleName ?? '';
      const driverName = e.driver?.user?.name ?? e.driverName ?? '';
      const startLocation = e.trip?.startLocation ?? e.startLocation ?? '';
      const endLocation = e.trip?.endLocation ?? e.endLocation ?? '';
      const matchSearch = !search || [vehicleName, driverName, startLocation, endLocation].some((f) => f.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [expenses, search, statusFilter]);

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
          {isLoading && expenses.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                Loading expenses...
              </div>
            </div>
          ) : isError ? (
            <div className="p-4 bg-destructive/10 border-b border-destructive/50 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <div>
                <p className="font-medium">Failed to load expenses</p>
                <p className="text-xs">{error instanceof Error ? error.message : 'Please try again later'}</p>
              </div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No expenses found</div>
          ) : (
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
                {filtered.map((e) => {
                  const startLocation = e.trip?.startLocation ?? e.startLocation ?? 'N/A';
                  const endLocation = e.trip?.endLocation ?? e.endLocation ?? 'N/A';
                  const driverName = e.driver?.user?.name ?? e.driverName ?? 'Unknown Driver';
                  const vehicleName = e.vehicle?.name ?? e.vehicleName ?? 'Unknown Vehicle';

                  return (
                  <tr key={e._id} className="data-table-row">
                    <td className="px-6 py-3 font-medium">{startLocation} → {endLocation}</td>
                    <td className="px-6 py-3">{driverName}</td>
                    <td className="px-6 py-3">{vehicleName}</td>
                    <td className="px-6 py-3 font-mono">₹{(e.fuelCost ?? 0).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-3 font-mono">₹{(e.miscExpense ?? 0).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-3">{e.distance ?? 0} km</td>
                    <td className="px-6 py-3"><StatusBadge status={(e.status ?? 'pending') as Expense['status']} /></td>
                  </tr>
                  );
                })}
                {filtered.length === 0 && expenses.length > 0 && (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No expenses match your filters</td></tr>
                )}
              </tbody>
            </table>
          )}
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
