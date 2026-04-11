import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockEmployees } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import type { UserRole } from '@/types/fleet';

const roleLabels: Record<string, string> = {
  manager: 'Manager',
  driver: 'Driver',
  dispatcher: 'Dispatcher',
  safety_officer: 'Safety Officer',
  financial_analyst: 'Financial Analyst',
};

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = mockEmployees.filter((e) => {
    const matchSearch = !search || [e.name, e.email].some((f) => f.toLowerCase().includes(search.toLowerCase()));
    const matchRole = roleFilter === 'all' || e.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Employees</h1>
            <p className="page-description">Manage your team members</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Add Employee</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>Add Employee</DialogTitle></DialogHeader>
              <EmployeeForm onClose={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="filter-bar">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search employees..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="driver">Driver</SelectItem>
              <SelectItem value="dispatcher">Dispatcher</SelectItem>
              <SelectItem value="safety_officer">Safety Officer</SelectItem>
              <SelectItem value="financial_analyst">Financial Analyst</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Driver Status</th>
                <th className="px-6 py-3 font-medium">License</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp._id} className="data-table-row">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {emp.name.charAt(0)}
                      </div>
                      <span className="font-medium">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{emp.email}</td>
                  <td className="px-6 py-3">
                    <span className="status-badge bg-secondary text-secondary-foreground">{roleLabels[emp.role]}</span>
                  </td>
                  <td className="px-6 py-3">{emp.driver ? <StatusBadge status={emp.driver.status} /> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-6 py-3 font-mono text-xs">{emp.driver?.licenseNumber || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

function EmployeeForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' as UserRole | '', licenseNumber: '', licenseExpiry: '', licenseCategory: '' });
  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: e.target.value });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="space-y-4 mt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Full Name</Label><Input placeholder="Arjun Sharma" value={form.name} onChange={update('name')} required /></div>
        <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="arjun@company.com" value={form.email} onChange={update('email')} required /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="••••••" value={form.password} onChange={update('password')} required /></div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
            <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="driver">Driver</SelectItem>
              <SelectItem value="dispatcher">Dispatcher</SelectItem>
              <SelectItem value="safety_officer">Safety Officer</SelectItem>
              <SelectItem value="financial_analyst">Financial Analyst</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {form.role === 'driver' && (
        <div className="space-y-4 border-t pt-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Driver License</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2"><Label>License Number</Label><Input placeholder="DL15PA017" value={form.licenseNumber} onChange={update('licenseNumber')} required /></div>
            <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={form.licenseExpiry} onChange={update('licenseExpiry')} required /></div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.licenseCategory} onValueChange={(v) => setForm({ ...form, licenseCategory: v })}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="bike">Bike</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Add Employee</Button>
      </div>
    </form>
  );
}
