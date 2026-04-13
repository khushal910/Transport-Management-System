import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getDashboardData, getSafetyMetrics } from '@/api/dashboard';
import { getAnalyticsData } from '@/api/analytics';
import { useAuth } from '@/context/AuthContext';
import { Truck, Users, Route, DollarSign, TrendingUp, Package, AlertCircle, Shield, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardState {
  loading: boolean;
  error: string | null;
  data: any;
}

// ─── Safety Officer Dashboard ────────────────────────────────────────────────
function SafetyDashboard() {
  const [state, setState] = useState<DashboardState>({ loading: true, error: null, data: null });

  useEffect(() => {
    getSafetyMetrics()
      .then((res) => setState({ loading: false, error: null, data: res.data }))
      .catch((err) => setState({ loading: false, error: err?.message ?? 'Failed to load safety metrics', data: null }));
  }, []);

  if (state.loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="page-title">Safety Dashboard</h1><p className="page-description">Driver safety and compliance metrics</p></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="kpi-card animate-pulse h-32 bg-muted" />)}
        </div>
      </div>
    );
  }

  if (state.error || !state.data) {
    return (
      <div className="space-y-6">
        <div><h1 className="page-title">Safety Dashboard</h1></div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="font-medium text-destructive">{state.error ?? 'Failed to load safety data'}</p>
        </div>
      </div>
    );
  }

  const m = state.data;
  return (
    <div className="space-y-6">
      <div><h1 className="page-title">Safety Dashboard</h1><p className="page-description">Driver safety and compliance metrics</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KPICard title="Expired Licenses" value={m.expiredLicenses ?? 0} subtitle="drivers" icon={AlertCircle} trend={{ value: 0, positive: (m.expiredLicenses ?? 0) === 0 }} />
        <KPICard title="Low Safety Score" value={m.lowSafetyScores ?? 0} subtitle="below 70%" icon={Shield} trend={{ value: 0, positive: (m.lowSafetyScores ?? 0) === 0 }} />
        <KPICard title="High Risk Drivers" value={m.highRiskDrivers ?? 0} subtitle="below 60%" icon={Users} trend={{ value: 0, positive: (m.highRiskDrivers ?? 0) === 0 }} />
        <KPICard title="Recent Accidents" value={m.recentAccidents ?? 0} subtitle="last 30 days" icon={Activity} trend={{ value: 0, positive: (m.recentAccidents ?? 0) === 0 }} />
        <KPICard title="Maintenance Alerts" value={m.maintenanceAlerts ?? 0} subtitle="vehicles in shop" icon={Truck} trend={{ value: 0, positive: (m.maintenanceAlerts ?? 0) === 0 }} />
      </div>
    </div>
  );
}

// ─── Financial Analyst Dashboard ─────────────────────────────────────────────
const formatCurrency = (val: number) =>
  '₹' + (val >= 100000 ? (val / 100000).toFixed(1) + 'L' : val.toLocaleString('en-IN'));

function FinancialDashboard() {
  const [state, setState] = useState<DashboardState>({ loading: true, error: null, data: null });

  useEffect(() => {
    getAnalyticsData()
      .then((res) => setState({ loading: false, error: null, data: res.data }))
      .catch((err) => setState({ loading: false, error: err?.message ?? 'Failed to load financial data', data: null }));
  }, []);

  if (state.loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="page-title">Financial Dashboard</h1><p className="page-description">Revenue, expenses and cost analysis</p></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="kpi-card animate-pulse h-32 bg-muted" />)}
        </div>
      </div>
    );
  }

  if (state.error || !state.data) {
    return (
      <div className="space-y-6">
        <div><h1 className="page-title">Financial Dashboard</h1></div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="font-medium text-destructive">{state.error ?? 'Failed to load financial data'}</p>
        </div>
      </div>
    );
  }

  const kpis = state.data.fleetKPIs ?? {};
  const monthly = state.data.monthlyFinancial ?? [];

  return (
    <div className="space-y-6">
      <div><h1 className="page-title">Financial Dashboard</h1><p className="page-description">Revenue, expenses and cost analysis</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Revenue" value={formatCurrency(kpis.totalRevenue ?? 0)} subtitle="all trips" icon={TrendingUp} trend={{ value: kpis.fleetROI ?? 0, positive: (kpis.fleetROI ?? 0) >= 0 }} />
        <KPICard title="Total Expenses" value={formatCurrency(kpis.totalExpense ?? 0)} subtitle="fuel + maintenance" icon={DollarSign} trend={{ value: 0, positive: false }} />
        <KPICard title="Net Profit" value={formatCurrency(kpis.totalNetProfit ?? 0)} subtitle="revenue - expenses" icon={TrendingUp} trend={{ value: kpis.fleetROI ?? 0, positive: (kpis.fleetROI ?? 0) >= 0 }} />
        <KPICard title="Fleet ROI" value={`${kpis.fleetROI ?? 0}%`} subtitle="return on investment" icon={TrendingUp} trend={{ value: kpis.fleetROI ?? 0, positive: (kpis.fleetROI ?? 0) >= 0 }} />
      </div>

      {monthly.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Monthly Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="fuelCost" fill="hsl(25, 95%, 53%)" radius={[4, 4, 0, 0]} name="Fuel Cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── Manager / Dispatcher Dashboard ──────────────────────────────────────────
function OperationsDashboard() {
  const [state, setState] = useState<DashboardState>({ loading: true, error: null, data: null });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setState({ loading: true, error: null, data: null });
        const response = await getDashboardData();
        if (response.data) {
          setState({ loading: false, error: null, data: response.data });
        } else {
          setState({ loading: false, error: 'Failed to load dashboard data', data: null });
        }
      } catch (error) {
        setState({ loading: false, error: error instanceof Error ? error.message : 'Failed to load dashboard', data: null });
      }
    };
    fetchDashboardData();
  }, []);

  if (state.loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="page-title">Dashboard</h1><p className="page-description">Overview of your fleet operations</p></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="kpi-card animate-pulse h-32 bg-muted" />)}
        </div>
      </div>
    );
  }

  if (state.error || !state.data) {
    return (
      <div className="space-y-6">
        <div><h1 className="page-title">Dashboard</h1><p className="page-description">Overview of your fleet operations</p></div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div>
            <p className="font-medium text-destructive">{state.error ?? 'Failed to load dashboard'}</p>
            <button onClick={() => window.location.reload()} className="text-sm text-destructive underline mt-1">Try again</button>
          </div>
        </div>
      </div>
    );
  }

  const kpis = state.data.kpis ?? {};
  const trips = state.data.trips ?? [];

  const tripStatusCounts = {
    completed: trips.filter((t: any) => t.status === 'completed').length,
    draft: trips.filter((t: any) => t.status === 'draft').length,
    dispatched: trips.filter((t: any) => t.status === 'dispatched').length,
    cancelled: trips.filter((t: any) => t.status === 'cancelled').length,
  };

  const tripStatusData = [
    { name: 'Completed', value: tripStatusCounts.completed, fill: 'hsl(142, 71%, 45%)' },
    { name: 'Draft', value: tripStatusCounts.draft, fill: 'hsl(220, 14%, 70%)' },
    { name: 'Dispatched', value: tripStatusCounts.dispatched, fill: 'hsl(199, 89%, 48%)' },
  ].filter((item) => item.value > 0);

  const totalRevenue = trips.reduce((sum: number, trip: any) => sum + (trip.revenue || 0), 0);

  return (
    <div className="space-y-6">
      <div><h1 className="page-title">Dashboard</h1><p className="page-description">Overview of your fleet operations</p></div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard title="Active Fleet" value={kpis.activeFleet ?? 0} subtitle="vehicles in use" icon={Truck} trend={{ value: 0, positive: true }} />
        <KPICard title="Maintenance Alerts" value={kpis.maintenanceAlerts ?? 0} subtitle="vehicles in shop" icon={AlertCircle} trend={{ value: 0, positive: false }} />
        <KPICard title="Pending Cargo" value={kpis.pendingCargo ?? 0} subtitle="trips waiting" icon={Package} trend={{ value: 0, positive: true }} />
        <KPICard title="Completed Today" value={kpis.completedToday ?? 0} subtitle="trips completed" icon={Route} trend={{ value: 0, positive: true }} />
        <KPICard title="Pending Assignment" value={kpis.pendingAssignment ?? 0} subtitle="unassigned trips" icon={Users} trend={{ value: 0, positive: true }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-xl border bg-card p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Trip Status Distribution</h3>
          {trips.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={Object.entries(tripStatusCounts).map(([status, count]) => ({ status, count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">No trip data available</div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Trip Status Breakdown</h3>
          {tripStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={tripStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                    {tripStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {tripStatusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">No trips yet</div>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2"><TrendingUp className="h-4 w-4 text-primary" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-warning/10 p-2"><Package className="h-4 w-4 text-warning" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Trips</p>
              <p className="text-xl font-bold">{trips.length}</p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-2"><DollarSign className="h-4 w-4 text-success" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Active Fleet</p>
              <p className="text-xl font-bold">{kpis.activeFleet ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="border-b p-6 pb-4"><h3 className="text-sm font-semibold">Recent Trips</h3></div>
        <div className="overflow-x-auto">
          {trips.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Trip #</th>
                  <th className="px-6 py-3 font-medium">Vehicle</th>
                  <th className="px-6 py-3 font-medium">Driver</th>
                  <th className="px-6 py-3 font-medium">Cargo Weight</th>
                  <th className="px-6 py-3 font-medium">Revenue</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {trips.slice(0, 10).map((trip: any) => (
                  <tr key={trip.tripId} className="data-table-row">
                    <td className="px-6 py-3 font-medium">{trip.tripNumber}</td>
                    <td className="px-6 py-3">{trip.vehicle?.licensePlate ?? 'N/A'}</td>
                    <td className="px-6 py-3">{trip.driver?.name ?? 'N/A'}</td>
                    <td className="px-6 py-3">{trip.cargoWeight?.toLocaleString('en-IN')} kg</td>
                    <td className="px-6 py-3 font-mono">₹{trip.revenue?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-3"><StatusBadge status={trip.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">No trips available</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();

  const renderDashboard = () => {
    if (user?.role === 'safety_officer') return <SafetyDashboard />;
    if (user?.role === 'financial_analyst') return <FinancialDashboard />;
    return <OperationsDashboard />;
  };

  return <DashboardLayout>{renderDashboard()}</DashboardLayout>;
}
