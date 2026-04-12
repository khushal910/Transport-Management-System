import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/shared/KPICard';
import { TrendingUp, DollarSign, Fuel, Gauge } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { getAnalyticsData } from '@/api/analytics';

const mockMonthlyData = [
  { month: 'Jan', revenue: 600000, expenses: 150000, profit: 450000 },
  { month: 'Feb', revenue: 750000, expenses: 200000, profit: 550000 },
  { month: 'Mar', revenue: 850000, expenses: 220000, profit: 630000 },
];

const mockVehicleUtilization = [
  { name: 'Truck-001', rate: 92 },
  { name: 'Van-002', rate: 78 },
  { name: 'Truck-003', rate: 65 },
  { name: 'Bike-004', rate: 45 },
  { name: 'Truck-005', rate: 88 },
];

const mockAnalyticsData = {
  monthlyData: mockMonthlyData,
  vehicleUtilization: mockVehicleUtilization,
};

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const result = await getAnalyticsData();
      return result.data;
    },
    refetchOnWindowFocus: false,
    retry: false,
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use mock data if API fails (development mode)
  const analyticsData = useMemo(() => {
    return data || mockAnalyticsData;
  }, [data]);

  const monthlyData = analyticsData.monthlyData || mockMonthlyData;
  const vehicleUtilization = analyticsData.vehicleUtilization || mockVehicleUtilization;

  const formatCurrency = (val: number) =>
    '₹' + (val >= 100000 ? (val / 100000).toFixed(1) + 'L' : val.toLocaleString('en-IN'));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-description">Financial and operational insights</p>
        </div>

        {isError && !data && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-center gap-2">
            <span>⚠️</span>
            <span>Using demo data (API unavailable. Please sign in to see real data.)</span>
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              Loading analytics...
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard title="Total Revenue" value="₹45L" subtitle="Q1 2026" icon={TrendingUp} trend={{ value: 15, positive: true }} />
              <KPICard title="Total Expenses" value="₹12L" subtitle="Q1 2026" icon={DollarSign} trend={{ value: 3, positive: false }} />
              <KPICard title="Fuel Efficiency" value="6.5 km/L" subtitle="Fleet average" icon={Fuel} trend={{ value: 2, positive: true }} />
              <KPICard title="Utilization" value="78.5%" subtitle="Fleet average" icon={Gauge} trend={{ value: 5, positive: true }} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">Monthly Revenue & Profit</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(199, 89%, 48%)" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="profit" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">Vehicle Utilization Rate</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vehicleUtilization} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
                    <XAxis type="number" tick={{ fontSize: 12 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Bar dataKey="rate" fill="hsl(199, 89%, 48%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">Monthly Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Month</th>
                      <th className="px-4 py-3 font-medium">Revenue</th>
                      <th className="px-4 py-3 font-medium">Expenses</th>
                      <th className="px-4 py-3 font-medium">Profit</th>
                      <th className="px-4 py-3 font-medium">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((row) => (
                      <tr key={row.month} className="data-table-row">
                        <td className="px-4 py-3 font-medium">{row.month}</td>
                        <td className="px-4 py-3 font-mono">{formatCurrency(row.revenue)}</td>
                        <td className="px-4 py-3 font-mono">{formatCurrency(row.expenses)}</td>
                        <td className="px-4 py-3 font-mono text-success">{formatCurrency(row.profit)}</td>
                        <td className="px-4 py-3 font-semibold">{((row.profit / row.revenue) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
