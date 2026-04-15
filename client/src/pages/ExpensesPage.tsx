import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getExpenseList, updateExpense, type ExpenseListItem } from '@/api/expense';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Search, AlertCircle, Check, ChevronsUpDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

type ExpenseRow = ExpenseListItem;

export default function ExpensesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canCreate = user?.role === 'manager' || user?.role === 'dispatcher' || user?.role === 'driver';

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
    const apiExpenses = (data as { expenses?: ExpenseRow[] | Record<string, ExpenseRow[]> } | undefined)?.expenses;

    if (Array.isArray(apiExpenses)) {
      return apiExpenses;
    }

    if (apiExpenses && typeof apiExpenses === 'object') {
      return Object.values(apiExpenses).flat();
    }

    return [];
  }, [data]);

  const pendingExpenses = useMemo(() => {
    return expenses.filter((expense) => (expense.status ?? 'pending') === 'pending');
  }, [expenses]);

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

  const openExpenseDialog = (expenseId?: string) => {
    if (expenseId) {
      setSelectedExpenseId(expenseId);
    } else if (pendingExpenses.length > 0) {
      setSelectedExpenseId(pendingExpenses[0]._id);
    } else {
      setSelectedExpenseId('');
    }

    setDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Expenses</h1>
            <p className="page-description">Track fuel and miscellaneous trip expenses</p>
          </div>
          {canCreate && (
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) {
                  setSelectedExpenseId('');
                }
              }}
            >
              <DialogTrigger asChild>
                <Button type="button" onClick={() => openExpenseDialog()} disabled={!pendingExpenses.length}>
                  <Plus className="mr-2 h-4 w-4" />Fill Pending Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Submit Trip Expense</DialogTitle>
                  <DialogDescription className="sr-only">
                    Select a pending expense created from a completed trip and submit fuel, misc, and distance values.
                  </DialogDescription>
                </DialogHeader>
                <ExpenseForm
                  pendingExpenses={pendingExpenses}
                  selectedExpenseId={selectedExpenseId}
                  onSelectExpense={setSelectedExpenseId}
                  onClose={() => setDialogOpen(false)}
                  onSubmitted={() => {
                    queryClient.invalidateQueries({ queryKey: ['expenses'] });
                    setDialogOpen(false);
                    setSelectedExpenseId('');
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {pendingExpenses.length > 0 && (
          <div className="rounded-xl border border-amber-300/60 bg-amber-50/50 p-4">
            <p className="text-sm font-medium text-amber-900">{pendingExpenses.length} completed trip(s) are waiting for expense submission.</p>
            <p className="text-xs text-amber-800 mt-1">Click Fill Expense in the table or use the Fill Pending Expense button.</p>
          </div>
        )}

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
                  <th className="px-6 py-3 font-medium">Action</th>
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
                    <td className="px-6 py-3"><StatusBadge status={e.status ?? 'pending'} /></td>
                    <td className="px-6 py-3">
                      {canCreate && (e.status ?? 'pending') === 'pending' ? (
                        <Button type="button" size="sm" variant="outline" onClick={() => openExpenseDialog(e._id)}>
                          Fill Expense
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                  );
                })}
                {filtered.length === 0 && expenses.length > 0 && (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">No expenses match your filters</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function ExpenseForm({
  pendingExpenses,
  selectedExpenseId,
  onSelectExpense,
  onClose,
  onSubmitted,
}: {
  pendingExpenses: ExpenseRow[];
  selectedExpenseId: string;
  onSelectExpense: (expenseId: string) => void;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [form, setForm] = useState({ fuelCost: '', miscExpense: '', distance: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedExpense = useMemo(() => {
    return pendingExpenses.find((expense) => expense._id === selectedExpenseId);
  }, [pendingExpenses, selectedExpenseId]);

  useEffect(() => {
    if (!selectedExpense) {
      setForm({ fuelCost: '', miscExpense: '', distance: '' });
      return;
    }

    setForm({
      fuelCost: selectedExpense.fuelCost > 0 ? String(selectedExpense.fuelCost) : '',
      miscExpense: selectedExpense.miscExpense > 0 ? String(selectedExpense.miscExpense) : '',
      distance: selectedExpense.distance > 0 ? String(selectedExpense.distance) : '',
    });
    setErrors({});
  }, [selectedExpense]);

  const filteredPendingExpenses = useMemo(() => {
    if (!expenseSearch.trim()) {
      return pendingExpenses;
    }

    const term = expenseSearch.toLowerCase();
    return pendingExpenses.filter((expense) => {
      const route = `${expense.startLocation ?? ''} ${expense.endLocation ?? ''}`;
      return [expense.driverName ?? '', expense.vehicleName ?? '', expense.plateNumber ?? '', route]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [pendingExpenses, expenseSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!selectedExpenseId) {
      newErrors.expense = 'Select a pending trip expense';
    }
    if (form.fuelCost === '') {
      newErrors.fuelCost = 'Fuel cost is required';
    } else if (Number(form.fuelCost) < 0 || Number.isNaN(Number(form.fuelCost))) {
      newErrors.fuelCost = 'Fuel cost must be a non-negative number';
    }
    if (form.miscExpense !== '' && (Number(form.miscExpense) < 0 || Number.isNaN(Number(form.miscExpense)))) {
      newErrors.miscExpense = 'Misc expense must be a non-negative number';
    }
    if (form.distance === '') {
      newErrors.distance = 'Distance is required';
    } else if (Number(form.distance) <= 0 || Number.isNaN(Number(form.distance))) {
      newErrors.distance = 'Distance must be greater than 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      await updateExpense(selectedExpenseId, {
        fuelCost: Number(form.fuelCost),
        miscExpense: form.miscExpense ? Number(form.miscExpense) : 0,
        distance: Number(form.distance),
      });

      setSubmitMessage({ type: 'success', text: 'Expense submitted successfully' });
      setTimeout(() => onSubmitted(), 1000);
    } catch (error) {
      setSubmitMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to submit expense' });
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
        <Label>Pending Trip Expense</Label>
        <Popover open={expenseOpen} onOpenChange={setExpenseOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" role="combobox" className={cn('w-full justify-between', errors.expense && 'border-destructive')}>
              {selectedExpense
                ? `${selectedExpense.startLocation ?? 'N/A'} → ${selectedExpense.endLocation ?? 'N/A'} (${selectedExpense.vehicleName ?? 'Vehicle'})`
                : 'Select pending expense...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <div className="p-2">
              <Input
                placeholder="Search pending expenses..."
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                className="mb-2"
              />
              <div className="max-h-56 overflow-y-auto">
                {filteredPendingExpenses.length === 0 ? (
                  <div className="px-2 py-8 text-center text-sm text-muted-foreground">No pending expenses found</div>
                ) : (
                  filteredPendingExpenses.map((expense) => (
                    <Button
                      type="button"
                      key={expense._id}
                      variant="ghost"
                      className="w-full justify-start mb-1 font-normal"
                      onClick={() => {
                        onSelectExpense(expense._id);
                        setExpenseOpen(false);
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.expense;
                          return next;
                        });
                      }}
                    >
                      <Check className={cn('mr-2 h-4 w-4', selectedExpenseId === expense._id ? 'opacity-100' : 'opacity-0')} />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{expense.startLocation ?? 'N/A'} → {expense.endLocation ?? 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{expense.driverName ?? 'N/A'} • {expense.vehicleName ?? 'N/A'}</div>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {errors.expense && <p className="text-xs text-destructive">{errors.expense}</p>}
      </div>

      {selectedExpense && (
        <div className="rounded-lg border bg-muted/30 p-3 text-sm">
          <p className="font-medium">Trip: {selectedExpense.startLocation ?? 'N/A'} → {selectedExpense.endLocation ?? 'N/A'}</p>
          <p className="text-muted-foreground">Driver: {selectedExpense.driverName ?? 'N/A'} | Vehicle: {selectedExpense.vehicleName ?? 'N/A'}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Fuel Cost (₹)</Label>
          <Input
            type="number"
            placeholder="e.g., 2500"
            value={form.fuelCost}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, fuelCost: e.target.value }));
              if (errors.fuelCost) {
                setErrors((prev) => ({ ...prev, fuelCost: '' }));
              }
            }}
            className={errors.fuelCost ? 'border-destructive' : ''}
          />
          {errors.fuelCost && <p className="text-xs text-destructive">{errors.fuelCost}</p>}
        </div>
        <div className="space-y-2">
          <Label>Misc Expense (₹)</Label>
          <Input
            type="number"
            placeholder="e.g., 500"
            value={form.miscExpense}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, miscExpense: e.target.value }));
              if (errors.miscExpense) {
                setErrors((prev) => ({ ...prev, miscExpense: '' }));
              }
            }}
            className={errors.miscExpense ? 'border-destructive' : ''}
          />
          {errors.miscExpense && <p className="text-xs text-destructive">{errors.miscExpense}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Distance (km)</Label>
        <Input
          type="number"
          placeholder="e.g., 850"
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

      {pendingExpenses.length === 0 && (
        <p className="text-sm text-muted-foreground">No pending expenses found. Completed trips will appear here automatically.</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting || pendingExpenses.length === 0 || !selectedExpenseId}>
          {isSubmitting ? 'Submitting...' : 'Submit Expense'}
        </Button>
      </div>
    </form>
  );
}
