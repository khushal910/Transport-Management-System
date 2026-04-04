import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotification';
import dashboardBaseURL from '../../api/dashboardBaseURL';
import vehicleBaseURL from '../../api/vehicleBaseURL';
import driverBaseURL from '../../api/driverBaseURL';
import safetyBaseURL from '../../api/safetyBaseURL';
import DashboardKPIs from '../../components/DashboardKPIs';
import { PageContainer, PageHeader } from '../../components/ui';
import { SafetyAlertBanner } from '../../components/SafetyAlertBanner';
import { TrendingUp, BarChart3, AlertCircle, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';

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
  const navigate = useNavigate();
  const { notifyError } = useNotification();
  const [trips, setTrips] = useState([]);
  const [kpis, setKpis] = useState({
    activeTrips: 0,
    completedToday: 0,
    pendingAssignment: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardBaseURL.get('/kpis');
        if (response.data?.success) {
          setTrips(response.data.data.trips);
          setKpis({
            activeTrips: response.data.data.trips.filter(
              (t) => t.status === 'dispatched'
            ).length,
            completedToday: response.data.data.kpis?.completedToday || 0,
            pendingAssignment: response.data.data.kpis?.pendingAssignment || 0,
          });
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
          <div 
            onClick={() => navigate('/main/trip-dispatcher?status=dispatched')}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Active Trips</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{kpis.activeTrips}</p>
              </div>
              <span className="text-4xl">🛣️</span>
            </div>
          </div>

          <div 
            onClick={() => navigate('/main/trip-dispatcher?status=completed')}
            className="bg-green-50 border border-green-200 rounded-lg p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{kpis.completedToday}</p>
              </div>
              <span className="text-4xl">✅</span>
            </div>
          </div>

          <div 
            onClick={() => navigate('/main/trip-dispatcher?status=draft')}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Pending Assignment</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{kpis.pendingAssignment}</p>
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
  const navigate = useNavigate();
  const { notifyError } = useNotification();
  const [safetyStats, setSafetyStats] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to get days until license expiry
  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Fetch safety metrics, drivers, and vehicles
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch safety metrics
        const safetyRes = await dashboardBaseURL.get('/safety-metrics');
        if (safetyRes.data?.success) {
          setSafetyStats(safetyRes.data.data);
        }

        // Fetch drivers data
        try {
          const driversRes = await safetyBaseURL.get('/drivers');
          if (driversRes.data?.success) {
            setDrivers(driversRes.data.data || []);
          }
        } catch (dErr) {
          console.error('Drivers fetch error:', dErr);
        }

        // Fetch vehicle data (mock for now)
        try {
          setVehicles([
            {
              _id: '1',
              licensePlate: 'KL-01-AB-1234',
              model: 'Tata 1412',
              maintenanceStatus: 'needs_maintenance',
              lastServiceDate: '2023-12-15',
            },
            {
              _id: '2',
              licensePlate: 'KL-01-CD-5678',
              model: 'Maruti Suzuki',
              maintenanceStatus: 'in_shop',
              lastServiceDate: '2024-01-05',
            },
          ]);
        } catch (vErr) {
          console.error('Vehicles fetch error:', vErr);
        }
      } catch (safetyError: any) {
        console.error('Safety metrics fetch failed:', safetyError?.response?.status, safetyError?.response?.data);
        notifyError(`Safety metrics error: ${safetyError?.response?.data?.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [notifyError]);

  // Filter drivers with license expiring in 3 days
  const driversExpiringIn3Days = drivers.filter(driver => {
    const daysLeft = getDaysUntilExpiry(driver.licenseExpiry);
    return daysLeft > 0 && daysLeft <= 3;
  });

  // Filter vehicles with pending maintenance
  const pendingMaintenanceVehicles = vehicles.filter(
    v => v.maintenanceStatus === 'needs_maintenance' || v.maintenanceStatus === 'in_shop'
  );

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🛡️</span>
          <div>
            <PageHeader 
              title="Safety Officer Dashboard" 
              description="Monitor key safety metrics and compliance"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && !safetyStats && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700 font-semibold">Unable to load safety metrics</p>
            <p className="text-red-600 text-sm mt-1">Please check the browser console for error details</p>
          </div>
        )}

        {/* Safety Metrics Cards - Clickable Navigation */}
        {safetyStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Expired Licenses Card */}
            <button
              onClick={() => navigate('/main/employee')}
              className="bg-red-50 border border-red-200 rounded-lg p-6 hover:bg-red-100 hover:border-red-300 transition cursor-pointer text-left"
            >
              <p className="text-sm text-gray-600 mb-2">Expired Licenses</p>
              <p className="text-4xl font-bold text-red-600">{safetyStats.expiredLicenses || 0}</p>
              <p className="text-xs text-red-600 mt-3">Click to view drivers</p>
            </button>

            {/* Recent Accidents Card */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Recent Accidents</p>
              <p className="text-4xl font-bold text-orange-600">{safetyStats.recentAccidents || 0}</p>
              <p className="text-xs text-orange-600 mt-3">Last 30 days</p>
            </div>

            {/* Low Safety Scores Card */}
            <button
              onClick={() => navigate('/main/employee')}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 hover:bg-yellow-100 hover:border-yellow-300 transition cursor-pointer text-left"
            >
              <p className="text-sm text-gray-600 mb-2">Low Safety Scores</p>
              <p className="text-4xl font-bold text-yellow-600">{safetyStats.lowSafetyScores || 0}</p>
              <p className="text-xs text-yellow-600 mt-3">Click to view drivers</p>
            </button>

            {/* Maintenance Alerts Card */}
            <button
              onClick={() => navigate('/main/maintenance')}
              className="bg-red-100 border border-red-300 rounded-lg p-6 hover:bg-red-200 hover:border-red-400 transition cursor-pointer text-left"
            >
              <p className="text-sm text-gray-600 mb-2">Maintenance Alerts</p>
              <p className="text-4xl font-bold text-red-600">{safetyStats.maintenanceAlerts || 0}</p>
              <p className="text-xs text-red-600 mt-3">Click to manage vehicles</p>
            </button>
          </div>
        )}

        {/* Quick Links Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/main/employee')}
              className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
            >
              <span className="text-2xl">👥</span>
              <div className="text-left">
                <p className="font-semibold text-gray-900">View All Drivers</p>
                <p className="text-sm text-gray-600">Check driver details and licenses</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/main/maintenance')}
              className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition"
            >
              <span className="text-2xl">🔧</span>
              <div className="text-left">
                <p className="font-semibold text-gray-900">View Maintenance</p>
                <p className="text-sm text-gray-600">Check vehicle maintenance status</p>
              </div>
            </button>
          </div>
        </div>

        {/* Drivers with License Expiring in 3 Days - Alert */}
        {!isLoading && driversExpiringIn3Days.length > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-800">⚠️ Licenses Expiring in 3 Days</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-yellow-100">
                    <th className="text-left py-3 px-4 font-semibold text-yellow-900">Driver Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-yellow-900">License Number</th>
                    <th className="text-left py-3 px-4 font-semibold text-yellow-900">Expiry Date</th>
                    <th className="text-center py-3 px-4 font-semibold text-yellow-900">Days Left</th>
                    <th className="text-center py-3 px-4 font-semibold text-yellow-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {driversExpiringIn3Days.map((driver) => (
                    <tr key={driver._id} className="border-b hover:bg-yellow-100">
                      <td className="py-3 px-4 font-semibold text-gray-900">{driver.name || 'N/A'}</td>
                      <td className="py-3 px-4 font-mono text-yellow-600">{driver.licenseNumber || 'N/A'}</td>
                      <td className="py-3 px-4">{new Date(driver.licenseExpiry).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-3 py-1 bg-yellow-200 text-yellow-900 rounded-full font-bold">
                          {getDaysUntilExpiry(driver.licenseExpiry)} days
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => navigate('/main/employee')}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vehicles with Pending Maintenance - Alert */}
        {!isLoading && pendingMaintenanceVehicles.length > 0 && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-orange-800">🔧 Vehicles Requiring Maintenance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-orange-100">
                    <th className="text-left py-3 px-4 font-semibold text-orange-900">License Plate</th>
                    <th className="text-left py-3 px-4 font-semibold text-orange-900">Model</th>
                    <th className="text-center py-3 px-4 font-semibold text-orange-900">Maintenance Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-orange-900">Last Serviced</th>
                    <th className="text-center py-3 px-4 font-semibold text-orange-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingMaintenanceVehicles.map((vehicle) => (
                    <tr key={vehicle._id} className="border-b hover:bg-orange-100">
                      <td className="py-3 px-4 font-mono font-semibold text-blue-600">{vehicle.licensePlate}</td>
                      <td className="py-3 px-4">{vehicle.model || 'N/A'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          vehicle.maintenanceStatus === 'in_shop' ? 'bg-orange-200 text-orange-900' : 'bg-red-200 text-red-900'
                        }`}>
                          {vehicle.maintenanceStatus === 'in_shop' ? 'In Shop' : 'Needs Maintenance'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600">
                        {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => navigate('/main/vehicle')}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition"
                        >
                          View Fleet
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

/**
 * Financial Analyst Dashboard - Finance Focus
 * Financial metrics and analytics
 */
export const FinancialAnalystDashboard = () => {
  const navigate = useNavigate();
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
              title="Financial Analyst Dashboard" 
              description="Track expenses and financial analytics"
            />
          </div>
        </div>

        {/* Financial KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/main/trip')}
            className="bg-green-50 border border-green-200 rounded-lg p-6 hover:bg-green-100 hover:border-green-300 transition cursor-pointer text-left"
          >
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600 mt-1">$45,230</p>
            <p className="text-xs text-green-600 mt-2">↑ 12% from last month</p>
          </button>

          <button
            onClick={() => navigate('/main/maintenance')}
            className="bg-red-50 border border-red-200 rounded-lg p-6 hover:bg-red-100 hover:border-red-300 transition cursor-pointer text-left"
          >
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className="text-3xl font-bold text-red-600 mt-1">$28,450</p>
            <p className="text-xs text-red-600 mt-2">↑ 5% from last month</p>
          </button>

          <button
            onClick={() => navigate('/main/vehicle')}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 hover:bg-blue-100 hover:border-blue-300 transition cursor-pointer text-left"
          >
            <p className="text-sm text-gray-600">Net Profit</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">$16,780</p>
            <p className="text-xs text-blue-600 mt-2">37% profit margin</p>
          </button>

          <button
            onClick={() => navigate('/main/employee')}
            className="bg-purple-50 border border-purple-200 rounded-lg p-6 hover:bg-purple-100 hover:border-purple-300 transition cursor-pointer text-left"
          >
            <p className="text-sm text-gray-600">Cost per Trip</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">$45.20</p>
            <p className="text-xs text-purple-600 mt-2">Average</p>
          </button>
        </div>

        {/* Expense Categories */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/main/vehicle')}
              className="w-full text-left p-4 rounded-lg hover:bg-blue-50 transition"
            >
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Fuel Costs</span>
                <span className="font-semibold text-gray-900">$12,450</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </button>
            <button
              onClick={() => navigate('/main/maintenance')}
              className="w-full text-left p-4 rounded-lg hover:bg-orange-50 transition"
            >
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Maintenance</span>
                <span className="font-semibold text-gray-900">$8,200</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </button>
            <button
              onClick={() => navigate('/main/employee')}
              className="w-full text-left p-4 rounded-lg hover:bg-green-50 transition"
            >
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Driver Wages</span>
                <span className="font-semibold text-gray-900">$5,800</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '21%' }}></div>
              </div>
            </button>
            <div className="p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Other Expenses</span>
                <span className="font-semibold text-gray-900">$2,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-600 h-2 rounded-full" style={{ width: '7%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Total Trips</span>
                <span className="font-semibold text-gray-900">1,250</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Avg Trip Value</span>
                <span className="font-semibold text-gray-900">$36.18</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Total Distance (km)</span>
                <span className="font-semibold text-gray-900">45,230</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Fuel Efficiency</span>
                <span className="font-semibold text-gray-900">8.5 km/L</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Gross Margin</span>
                <span className="font-semibold text-green-600">37%</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Operating Expenses Ratio</span>
                <span className="font-semibold text-orange-600">63%</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">ROI</span>
                <span className="font-semibold text-blue-600">12.4%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Break-even Trips/Day</span>
                <span className="font-semibold text-gray-900">18</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

