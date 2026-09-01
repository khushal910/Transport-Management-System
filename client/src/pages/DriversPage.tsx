import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getDriverList } from '@/api/driver';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Shield, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import type { Driver } from '@/types/fleet';
import { cn } from '@/lib/utils';

type DriverRow = Partial<Driver> & {
  _id: string;
  name?: string;
  email?: string;
};

export default function DriversPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { user } = useAuth();
  const showContactInfo = user?.role !== 'safety_officer';

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['drivers', statusFilter],
    queryFn: async () => {
      const result = await getDriverList();
      return result.data;
    },
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Get drivers from API - no fallback to mock data
  const drivers = useMemo<DriverRow[]>(() => {
    const apiDrivers = Array.isArray((data as { drivers?: DriverRow[] } | undefined)?.drivers)
      ? ((data as { drivers?: DriverRow[] }).drivers ?? [])
      : [];

    return apiDrivers;
  }, [data]);

  const filtered = useMemo(() => {
    return drivers.filter((d) => {
      const driverName = d.user?.name ?? d.name ?? '';
      const driverEmail = d.user?.email ?? d.email ?? '';
      const matchSearch = !search || [driverName, driverEmail, d.licenseNumber ?? ''].some((f) => f.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [drivers, search, statusFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Drivers</h1>
            <p className="page-description">Monitor driver performance and availability</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        <div className="filter-bar flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
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
          {isLoading && drivers.length === 0 ? (
            <div className="col-span-full space-y-4">
              <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Loading drivers...</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 w-full animate-pulse bg-muted/60 rounded-xl" />
                ))}
              </div>
            </div>
          ) : isError ? (
            <div className="col-span-full p-4 bg-destructive/10 border border-destructive/50 rounded-lg text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <div>
                <p className="font-medium">Failed to load drivers</p>
                <p className="text-xs">{error instanceof Error ? error.message : 'Please try again later'}</p>
              </div>
            </div>
          ) : drivers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">No drivers available</div>
          ) : (
            <>
              {filtered.map((driver) => {
                const driverName = driver.user?.name ?? driver.name ?? 'Unknown Driver';
                const driverEmail = driver.user?.email ?? driver.email ?? 'unknown@fleetflow.com';
                const safetyScore = driver.safetyScore ?? 0;
                const completionRate = driver.completionRate ?? 0;
                const assignedTrips = driver.assignedTrips ?? 0;
                const completedTrips = driver.completedTrips ?? 0;

                return (
                <div key={driver._id} className="rounded-xl border bg-card p-5 card-hover">
                   <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {driverName.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold">{driverName}</p>
                        {showContactInfo && (
                          <p className="text-xs text-muted-foreground">{driverEmail}</p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={(driver.status ?? 'off_duty') as Driver['status']} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">License</p>
                      <p className="font-mono text-xs font-medium">{driver.licenseNumber ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="capitalize font-medium">{driver.licenseCategory ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Completed</p>
                      <p className="font-medium">{completedTrips} / {assignedTrips}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Complaints</p>
                      <p className="font-medium">{driver.complaints ?? 0}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground"><Shield className="h-3 w-3" /> Safety Score</span>
                      <span className="font-semibold">{safetyScore}%</span>
                    </div>
                    <Progress value={safetyScore} className="h-1.5" />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span className="font-semibold">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="mt-1 h-1.5" />
                </div>
                );
              })}
              {filtered.length === 0 && drivers.length > 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground">No drivers match your filters</div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
