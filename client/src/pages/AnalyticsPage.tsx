import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/shared/KPICard';
import { TrendingUp, DollarSign, Fuel, Gauge, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { getAnalyticsData, AnalyticsData, MonthlyFinancial, UtilizationRate } from '@/api/analytics';

const formatCurrency = (val: number) =>
  '₹' + (val >= 100000 ? (val / 100000).toFixed(1) + 'L' : val.toLocaleString('en-IN'));

export default function AnalyticsPage() {
  const { data, isLoading, isError, error } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const result = await getAnalyticsData();
      return result.data;
    },
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const analyticsData = useMemo(() => data, [data]);
  const monthlyData = analyticsData?.monthlyFinancial ?? [];
  const utilizationData = (analyticsData?.utilizationRate ?? []).map((item: UtilizationRate) => ({
    name: item.vehicleName,
    rate: item.utilizationPercent,
  }));
  const fleetKPIs = analyticsData?.fleetKPIs;
  const averageFuelEfficiency = analyticsData?.fuelEfficiency?.length
    ? analyticsData.fuelEfficiency.reduce((sum, item) => sum + (typeof item.kmPerLiter === 'number' ? item.kmPerLiter : Number(item.kmPerLiter) || 0), 0) / analyticsData.fuelEfficiency.length
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-description">Financial and operational insights</p>
        </div>

        {isError && (
          <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <div>
              <p className="font-medium">Failed to load analytics data</p>
              <p className="text-xs">{error instanceof Error ? error.message : 'Please try again later'}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              Loading analytics...
            </div>
          </div>
        ) : analyticsData ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Total Revenue"
                value={formatCurrency(fleetKPIs?.totalRevenue ?? 0)}
                subtitle="Fleet total"
                icon={TrendingUp}
                trend={{ value: fleetKPIs?.fleetROI ?? 0, positive: (fleetKPIs?.fleetROI ?? 0) >= 0 }}
              />
              <KPICard
                title="Total Expense"
                value={formatCurrency(fleetKPIs?.totalExpense ?? 0)}
                subtitle="Fuel + maintenance"
                icon={DollarSign}
                trend={{ value: fleetKPIs?.fleetROI ?? 0, positive: (fleetKPIs?.fleetROI ?? 0) >= 0 }}
              />
              <KPICard
                title="Fuel Efficiency"
                value={`${averageFuelEfficiency.toFixed(1)} km/L`}
                subtitle="Fleet average"
                icon={Fuel}
                trend={{ value: 0, positive: averageFuelEfficiency >= 0 }}
              />
              <KPICard
                title="Utilization"
                value={`${fleetKPIs?.averageUtilization ?? 0}%`}
                subtitle="Fleet average"
                icon={Gauge}
                trend={{ value: 0, positive: true }}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">Monthly Revenue & Profit</h3>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(199, 89%, 48%)" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="netProfit" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">No monthly financial data available</div>
                )}
              </div>

              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">Vehicle Utilization Rate</h3>
                {utilizationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={utilizationData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
                      <XAxis type="number" tick={{ fontSize: 12 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={140} />
                      <Tooltip formatter={(v: number) => `${v}%`} />
                      <Bar dataKey="rate" fill="hsl(199, 89%, 48%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">No vehicle utilization data available</div>
                )}
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
                      <th className="px-4 py-3 font-medium">Fuel Cost</th>
                      <th className="px-4 py-3 font-medium">Maintenance Cost</th>
                      <th className="px-4 py-3 font-medium">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((row: MonthlyFinancial) => (
                      <tr key={row.month} className="data-table-row">
                        <td className="px-4 py-3 font-medium">{row.month}</td>
                        <td className="px-4 py-3 font-mono">{formatCurrency(row.revenue)}</td>
                        <td className="px-4 py-3 font-mono">{formatCurrency(row.fuelCost)}</td>
                        <td className="px-4 py-3 font-mono">{formatCurrency(row.maintenanceCost)}</td>
                        <td className="px-4 py-3 font-mono text-success">{formatCurrency(row.netProfit)}</td>
                      </tr>
                    ))}
                    {monthlyData.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                          No monthly financial data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-muted-foreground">No analytics data available</div>
        )}
      </div>
    </DashboardLayout>
  );
}
