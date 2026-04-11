import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockDrivers } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function DriversPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = mockDrivers.filter((d) => {
    const matchSearch = !search || [d.user.name, d.user.email, d.licenseNumber].some((f) => f.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Drivers</h1>
          <p className="page-description">Monitor driver performance and availability</p>
        </div>

        <div className="filter-bar">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search drivers..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="on_duty">On Duty</SelectItem>
              <SelectItem value="off_duty">Off Duty</SelectItem>
              <SelectItem value="on_trip">On Trip</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((driver) => (
            <div key={driver._id} className="rounded-xl border bg-card p-5 card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {driver.user.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold">{driver.user.name}</p>
                    <p className="text-xs text-muted-foreground">{driver.user.email}</p>
                  </div>
                </div>
                <StatusBadge status={driver.status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">License</p>
                  <p className="font-mono text-xs font-medium">{driver.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="capitalize font-medium">{driver.licenseCategory}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completed</p>
                  <p className="font-medium">{driver.completedTrips} / {driver.assignedTrips}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Complaints</p>
                  <p className="font-medium">{driver.complaints}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground"><Shield className="h-3 w-3" /> Safety Score</span>
                  <span className="font-semibold">{driver.safetyScore}%</span>
                </div>
                <Progress value={driver.safetyScore} className="h-1.5" />
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-semibold">{driver.completionRate}%</span>
              </div>
              <Progress value={driver.completionRate} className="mt-1 h-1.5" />
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">No drivers found</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
