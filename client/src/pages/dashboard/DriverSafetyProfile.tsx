import React, { useEffect, useState } from 'react';
import { useNotification } from '../../hooks/useNotification';
import dashboardBaseURL from '../../api/dashboardBaseURL';
import { PageContainer, PageHeader, Grid } from '../../components/ui';
import { StatusPill } from '../../components/StatusPill';
import { AlertTriangle, Calendar, Zap, TrendingDown } from 'lucide-react';

export interface Driver {
  _id: string;
  name: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
  safetyScore: number;
  overSpeedingIncidents: number;
  harshBrakingCount: number;
  accidentHistory: number;
  status: 'active' | 'on_duty' | 'suspended' | 'inactive';
}

interface FilterOptions {
  showOnlyRisky: boolean;
  showOnlyExpired: boolean;
}

/**
 * Driver Safety Profile Page - Production Grade
 * Comprehensive driver safety metrics and compliance view
 */
export const DriverSafetyProfile = () => {
  const { notifyError } = useNotification();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    showOnlyRisky: false,
    showOnlyExpired: false,
  });

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await dashboardBaseURL.get('/drivers');
        if (response.data?.success) {
          // Mock data - in production, this would come from API
          const mockDrivers: Driver[] = response.data?.data || [
            {
              _id: '1',
              name: 'Rajesh Kumar',
              email: 'rajesh@company.com',
              licenseNumber: 'DL-123-456',
              licenseExpiry: '2024-03-15',
              safetyScore: 45,
              overSpeedingIncidents: 5,
              harshBrakingCount: 8,
              accidentHistory: 1,
              status: 'active',
            },
            {
              _id: '2',
              name: 'Amit Singh',
              email: 'amit@company.com',
              licenseNumber: 'DL-789-012',
              licenseExpiry: '2023-12-20',
              safetyScore: 25,
              overSpeedingIncidents: 12,
              harshBrakingCount: 15,
              accidentHistory: 3,
              status: 'suspended',
            },
            {
              _id: '3',
              name: 'Priya Sharma',
              email: 'priya@company.com',
              licenseNumber: 'DL-345-678',
              licenseExpiry: '2027-06-30',
              safetyScore: 92,
              overSpeedingIncidents: 0,
              harshBrakingCount: 1,
              accidentHistory: 0,
              status: 'active',
            },
          ];
          setDrivers(mockDrivers);
        }
      } catch (error) {
        notifyError('Failed to fetch driver data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrivers();
  }, [notifyError]);

  // Apply filters
  useEffect(() => {
    let filtered = [...drivers];

    if (filters.showOnlyRisky) {
      filtered = filtered.filter((d) => d.safetyScore < 60);
    }

    if (filters.showOnlyExpired) {
      const today = new Date();
      filtered = filtered.filter((d) => new Date(d.licenseExpiry) < today);
    }

    setFilteredDrivers(filtered);
  }, [drivers, filters]);

  const isLicenseExpired = (expiryDate: string): boolean => {
    return new Date(expiryDate) < new Date();
  };

  const getSafetyStatus = (score: number): 'critical' | 'warning' | 'safe' => {
    if (score < 40) return 'critical';
    if (score < 70) return 'warning';
    return 'safe';
  };

  const getStatusBadgeColor = (
    status: string
  ): 'critical' | 'warning' | 'safe' | 'normal' => {
    switch (status) {
      case 'suspended':
        return 'critical';
      case 'on_duty':
        return 'warning';
      case 'active':
        return 'safe';
      default:
        return 'normal';
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading driver profiles...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const expiredLicenses = drivers.filter((d) => isLicenseExpired(d.licenseExpiry)).length;
  const riskyDrivers = drivers.filter((d) => d.safetyScore < 60).length;

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">👥</span>
          <div>
            <PageHeader
              title="Driver Safety Profiles"
              description="Monitor driver compliance, safety scores, and license validity"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <Grid cols={4}>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600 font-semibold">Expired Licenses</p>
            <p className="text-3xl font-bold text-red-700 mt-2">{expiredLicenses}</p>
            <p className="text-xs text-red-600 mt-1">⚠️ Cannot be assigned</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-600 font-semibold">Risky Drivers</p>
            <p className="text-3xl font-bold text-yellow-700 mt-2">{riskyDrivers}</p>
            <p className="text-xs text-yellow-600 mt-1">Safety Score &lt; 60</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600 font-semibold">Total Drivers</p>
            <p className="text-3xl font-bold text-green-700 mt-2">{drivers.length}</p>
            <p className="text-xs text-green-600 mt-1">All drivers</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-semibold">Avg Safety Score</p>
            <p className="text-3xl font-bold text-blue-700 mt-2">
              {Math.round(
                drivers.reduce((sum, d) => sum + d.safetyScore, 0) / drivers.length
              )}
            </p>
            <p className="text-xs text-blue-600 mt-1">Fleet average</p>
          </div>
        </Grid>

        {/* Filters */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Filters</h3>
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showOnlyRisky}
                onChange={(e) =>
                  setFilters({ ...filters, showOnlyRisky: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Show only risky drivers (Score &lt; 60)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showOnlyExpired}
                onChange={(e) =>
                  setFilters({ ...filters, showOnlyExpired: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Show only expired licenses</span>
            </label>
          </div>
        </div>

        {/* Driver Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border border-gray-300">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Driver Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">License #</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">License Expiry</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Safety Score</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Over-Speeding</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Harsh Braking</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Accidents</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                    No drivers match the current filters
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => {
                  const expired = isLicenseExpired(driver.licenseExpiry);
                  const safetyStatus = getSafetyStatus(driver.safetyScore);

                  return (
                    <tr
                      key={driver._id}
                      className={`border border-gray-300 ${
                        expired ? 'bg-red-50' : safetyStatus === 'warning' ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-gray-900">{driver.name}</td>
                      <td className="px-4 py-3 text-gray-700">{driver.licenseNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span
                            className={`font-semibold ${
                              expired ? 'text-red-700 font-bold' : 'text-gray-700'
                            }`}
                          >
                            {new Date(driver.licenseExpiry).toLocaleDateString()}
                          </span>
                          {expired && (
                            <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                              EXPIRED
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusPill status={safetyStatus}>
                          {driver.safetyScore}%
                        </StatusPill>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 font-semibold">
                          <Zap className="h-4 w-4 text-orange-500" />
                          <span
                            className={driver.overSpeedingIncidents > 5 ? 'text-red-700' : ''}
                          >
                            {driver.overSpeedingIncidents}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 font-semibold">
                          <TrendingDown className="h-4 w-4 text-orange-500" />
                          <span
                            className={driver.harshBrakingCount > 10 ? 'text-red-700' : ''}
                          >
                            {driver.harshBrakingCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 font-semibold">
                          {driver.accidentHistory > 0 && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <span className={driver.accidentHistory > 0 ? 'text-red-700' : ''}>
                            {driver.accidentHistory}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={getStatusBadgeColor(driver.status)}>
                          {driver.status.replace('_', ' ').toUpperCase()}
                        </StatusPill>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Safety Indicators</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <StatusPill status="critical">Critical</StatusPill>
              <p className="text-xs text-gray-600 mt-1">Safety Score &lt; 40</p>
            </div>
            <div>
              <StatusPill status="warning">Warning</StatusPill>
              <p className="text-xs text-gray-600 mt-1">Safety Score 40-70</p>
            </div>
            <div>
              <StatusPill status="safe">Safe</StatusPill>
              <p className="text-xs text-gray-600 mt-1">Safety Score ≥ 70</p>
            </div>
            <div>
              <span className="inline-block bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                EXPIRED
              </span>
              <p className="text-xs text-gray-600 mt-1">License expired</p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DriverSafetyProfile;
