import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockKPIs, mockTrips } from '@/data/mockData';
import { Truck, Users, Route, DollarSign, TrendingUp, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 600000, expenses: 150000 },
  { month: 'Feb', revenue: 750000, expenses: 200000 },
  { month: 'Mar', revenue: 850000, expenses: 220000 },
];

const tripStatusData = [
  { name: 'Completed', value: 380, fill: 'hsl(142, 71%, 45%)' },
  { name: 'Draft', value: 50, fill: 'hsl(220, 14%, 70%)' },
  { name: 'Dispatched', value: 20, fill: 'hsl(199, 89%, 48%)' },
];

export default function DashboardPage() {
  const { overview, trips, revenueMetrics } = mockKPIs;

  const formatCurrency = (val: number) =>
    '₹' + (val >= 100000 ? (val / 100000).toFixed(1) + 'L' : val.toLocaleString('en-IN'));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">Overview of your fleet operations</p>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Total Vehicles" value={overview.totalVehicles} subtitle={`${overview.activeVehicles} active`} icon={Truck} trend={{ value: 8, positive: true }} />
          <KPICard title="Active Drivers" value={overview.activeDrivers} subtitle={`of ${overview.totalDrivers} total`} icon={Users} trend={{ value: 5, positive: true }} />
          <KPICard title="Trip Completion" value={`${trips.completionRate}%`} subtitle={`${trips.completedTrips} of ${trips.totalTrips}`} icon={Route} trend={{ value: 2.3, positive: true }} />
          <KPICard title="Net Profit" value={formatCurrency(revenueMetrics.netProfit)} subtitle={`ROI: ${revenueMetrics.roi}%`} icon={DollarSign} trend={{ value: 12, positive: true }} />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="col-span-2 rounded-xl border bg-card p-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Revenue vs Expenses</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                <Bar dataKey="revenue" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Trip Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={tripStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                  {tripStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
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
          </div>
        </div>

        {/* Revenue summary cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="kpi-card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2"><TrendingUp className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold">{formatCurrency(revenueMetrics.totalRevenue)}</p>
              </div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2"><Package className="h-4 w-4 text-warning" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-bold">{formatCurrency(revenueMetrics.totalExpenses)}</p>
              </div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2"><DollarSign className="h-4 w-4 text-success" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className="text-xl font-bold">{formatCurrency(revenueMetrics.netProfit)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent trips */}
        <div className="rounded-xl border bg-card">
          <div className="border-b p-6 pb-4">
            <h3 className="text-sm font-semibold">Recent Trips</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Vehicle</th>
                  <th className="px-6 py-3 font-medium">Driver</th>
                  <th className="px-6 py-3 font-medium">Route</th>
                  <th className="px-6 py-3 font-medium">Revenue</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockTrips.map((trip) => (
                  <tr key={trip._id} className="data-table-row">
                    <td className="px-6 py-3 font-medium">{trip.vehicle.name}</td>
                    <td className="px-6 py-3">{trip.driver.user.name}</td>
                    <td className="px-6 py-3">{trip.startLocation} → {trip.endLocation}</td>
                    <td className="px-6 py-3 font-mono">₹{trip.revenue.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-3"><StatusBadge status={trip.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
