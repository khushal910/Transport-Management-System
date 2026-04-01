import React, { useEffect, useState } from 'react';
import { useNotification } from '../../hooks/useNotification';
import dashboardBaseURL from '../../api/dashboardBaseURL';
import DashboardKPIs from '../../components/DashboardKPIs';
import { PageContainer, PageHeader } from '../../components/ui';
import { TrendingUp, BarChart3, AlertCircle } from 'lucide-react';

/**
 * Manager Dashboard - Full Control
 * Shows all metrics and KPIs
 */
export const ManagerDashboard = () => {
  const { notifyError } = useNotification();
  const [kpis, setKpis] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardBaseURL.get('/kpis');
        if (response.data?.success) {
          setKpis(response.data.data.kpis);
          setStats(response.data.data);
        }
      } catch (error) {
        notifyError('Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [notifyError]);

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">👑</span>
          <div>
            <PageHeader 
              title="Manager Dashboard - Full Control" 
              description="Complete visibility of all operations"
            />
          </div>
        </div>

        {/* Manager-Specific KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600 mt-1">$45,230</p>
              </div>
              <BarChart3 className="w-12 h-12 text-green-400 opacity-50" />
            </div>
            <p className="text-xs text-green-600 mt-3">↑ 12% from last month</p>
          </div>

          {/* Active Trips */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Trips</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{kpis?.activeTrips || 0}</p>
              </div>
              <BarChart3 className="w-12 h-12 text-blue-400 opacity-50" />
            </div>
            <p className="text-xs text-blue-600 mt-3">In progress</p>
          </div>

          {/* Fleet Utilization */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fleet Utilization</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">87%</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-400 opacity-50" />
            </div>
            <p className="text-xs text-purple-600 mt-3">Above average</p>
          </div>

          {/* Critical Alerts */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600 mt-1">3</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-400 opacity-50" />
            </div>
            <p className="text-xs text-red-600 mt-3">Require attention</p>
          </div>
        </div>

        {/* Main KPIs */}
        <DashboardKPIs kpis={kpis} isLoading={isLoading} />

        {/* Operations Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Operations Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-700">On-Time Deliveries</span>
                <span className="font-semibold text-green-600">94%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-700">Average Delivery Time</span>
                <span className="font-semibold text-blue-600">2.3 hours</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-700">Driver Safety Score</span>
                <span className="font-semibold text-purple-600">91/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Cost per Trip</span>
                <span className="font-semibold text-orange-600">$45.20</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="text-center pb-3 border-b">
                <p className="text-sm text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{kpis?.activeFleet || 0}</p>
              </div>
              <div className="text-center pb-3 border-b">
                <p className="text-sm text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold text-gray-900">42</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Maintenance Due</p>
                <p className="text-2xl font-bold text-gray-900">{kpis?.maintenanceAlerts || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

/**
 * Dispatcher Dashboard - Operations Focus
 * Limited data, focus on trips and operations
 */
export const DispatcherDashboard = () => {
  const { notifyError } = useNotification();
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardBaseURL.get('/kpis');
        if (response.data?.success) {
          setTrips(response.data.data.trips);
        }
      } catch (error) {
        notifyError('Failed to fetch trips data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [notifyError]);

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🚚</span>
          <div>
            <PageHeader 
              title="Dispatcher Dashboard - Operations" 
              description="Focus on trip management and dispatch"
            />
          </div>
        </div>

        {/* Operational KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Active Trips</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">12</p>
              </div>
              <span className="text-4xl">🛣️</span>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-3xl font-bold text-green-600 mt-1">28</p>
              </div>
              <span className="text-4xl">✅</span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Pending Assignment</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">5</p>
              </div>
              <span className="text-4xl">⏳</span>
            </div>
          </div>
        </div>

        {/* Recent Trips */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Trips</h3>
          {isLoading ? (
            <div className="text-center py-8">Loading trips...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-semibold text-gray-700">Trip ID</th>
                    <th className="text-left py-2 font-semibold text-gray-700">Driver</th>
                    <th className="text-left py-2 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-2 font-semibold text-gray-700">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.slice(0, 5).map((trip) => (
                    <tr key={trip._id} className="border-b hover:bg-gray-50">
                      <td className="py-2 font-mono text-blue-600">{trip.tripNumber}</td>
                      <td className="py-2">{trip.driver?.name || 'N/A'}</td>
                      <td className="py-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                          trip.status === 'dispatched' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="py-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${
                            trip.status === 'completed' ? 'bg-green-500 w-full' :
                            trip.status === 'dispatched' ? 'bg-blue-500 w-3/4' :
                            'bg-gray-400 w-1/4'
                          }`}></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

/**
 * Safety Officer Dashboard - Safety & Compliance Focus
 * Driver performance and safety metrics
 */
export const SafetyOfficerDashboard = () => {
  const { notifyError } = useNotification();
  const [safetyStats, setSafetyStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardBaseURL.get('/kpis');
        if (response.data?.success) {
          setSafetyStats(response.data.data);
        }
      } catch (error) {
        notifyError('Failed to fetch safety data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [notifyError]);

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🛡️</span>
          <div>
            <PageHeader 
              title="Safety Officer Dashboard - Compliance" 
              description="Monitor driver safety and compliance"
            />
          </div>
        </div>

        {/* Safety Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-2">Fleet Safety Score</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-green-600">91</span>
              <span className="text-lg text-green-600 mb-1">/100</span>
            </div>
            <p className="text-xs text-green-600 mt-3">✓ Excellent condition</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-2">Safety Incidents (30 Days)</p>
            <p className="text-4xl font-bold text-red-600">2</p>
            <p className="text-xs text-red-600 mt-3">⚠️ Monitor closely</p>
          </div>
        </div>

        {/* Driver Performance */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Driver Performance</h3>
          <div className="space-y-4">
            {[
              { name: 'John Smith', score: 95, violations: 0 },
              { name: 'Mike Johnson', score: 92, violations: 1 },
              { name: 'Sarah Davis', score: 88, violations: 2 },
            ].map((driver) => (
              <div key={driver.name} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                <div>
                  <p className="font-semibold text-gray-900">{driver.name}</p>
                  <p className="text-xs text-gray-500">{driver.violations} violations in 30 days</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${driver.score >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {driver.score}
                  </p>
                  <p className="text-xs text-gray-500">Safety Score</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Checklist */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
          <div className="space-y-3">
            {[
              { item: 'Vehicle Inspections Current', status: true },
              { item: 'Driver License Validations', status: true },
              { item: 'Insurance Documentation', status: true },
              { item: 'Maintenance Schedule', status: false },
            ].map((check) => (
              <div key={check.item} className="flex items-center gap-3">
                <span className={`text-xl ${check.status ? '✅' : '⚠️'}`}></span>
                <span className={check.status ? 'text-gray-700' : 'text-yellow-700 font-semibold'}>{check.item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

/**
 * Financial Analyst Dashboard - Finance Focus
 * Financial metrics and analytics
 */
export const FinancialAnalystDashboard = () => {
  const { notifyError } = useNotification();
  const [financialData, setFinancialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardBaseURL.get('/kpis');
        if (response.data?.success) {
          setFinancialData(response.data.data);
        }
      } catch (error) {
        notifyError('Failed to fetch financial data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [notifyError]);

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">📊</span>
          <div>
            <PageHeader 
              title="Financial Analyst Dashboard - Finance" 
              description="Track expenses and financial analytics"
            />
          </div>
        </div>

        {/* Financial KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600 mt-1">$45,230</p>
            <p className="text-xs text-green-600 mt-2">↑ 12% from last month</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className="text-3xl font-bold text-red-600 mt-1">$28,450</p>
            <p className="text-xs text-red-600 mt-2">↑ 5% from last month</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-sm text-gray-600">Net Profit</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">$16,780</p>
            <p className="text-xs text-blue-600 mt-2">37% profit margin</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <p className="text-sm text-gray-600">Cost per Trip</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">$45.20</p>
            <p className="text-xs text-purple-600 mt-2">↓ 2% from target</p>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
            <div className="space-y-3">
              {[
                { category: 'Fuel', amount: 12500, percentage: 44 },
                { category: 'Maintenance', amount: 8200, percentage: 29 },
                { category: 'Salaries', amount: 5400, percentage: 19 },
                { category: 'Insurance', amount: 2350, percentage: 8 },
              ].map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    <span className="text-sm font-semibold text-gray-900">${item.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{item.percentage}% of total</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-700">Monthly Revenue</span>
                <span className="font-semibold text-green-600">$45,230</span>
              </div>
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-700">Monthly Expenses</span>
                <span className="font-semibold text-red-600">$28,450</span>
              </div>
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-700">Net Profit</span>
                <span className="font-semibold text-blue-600">$16,780</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-semibold">Profit Margin</span>
                <span className="font-bold text-lg text-green-600">37%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
