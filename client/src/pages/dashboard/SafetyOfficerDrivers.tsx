import React, { useEffect, useState } from 'react';
import { PageContainer, PageHeader } from '../../components/ui';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import safetyBaseURL from '../../api/safetyBaseURL';
import { useNotification } from '../../hooks/useNotification';

/**
 * Safety Officer - Drivers View
 * Shows driver safety metrics, license status, complaints, and performance
 */
export const SafetyOfficerDrivers = () => {
  const { notifyError } = useNotification();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await safetyBaseURL.get('/drivers');
        if (response.data?.success) {
          setDrivers(response.data.data || []);
        } else {
          const message = response.data?.message || 'Unexpected response from safety API';
          setFetchError(message);
          notifyError(message);
        }
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Failed to connect to safety API';
        setFetchError(message);
        notifyError(message);
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDrivers();
  }, [notifyError]);

  const isLicenseExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getLicenseStatusColor = (driver: any) => {
    if (isLicenseExpired(driver.licenseExpiry)) {
      return 'bg-red-100 text-red-800';
    }
    const daysLeft = getDaysUntilExpiry(driver.licenseExpiry);
    if (daysLeft < 30) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const getSafetyScoreColor = (score: number = 100) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  // Summary stats
  const expiredLicenses = drivers.filter(d => isLicenseExpired(d.licenseExpiry)).length;
  const expiringsoon = drivers.filter(d => !isLicenseExpired(d.licenseExpiry) && getDaysUntilExpiry(d.licenseExpiry) < 30).length;
  const lowSafetyScores = drivers.filter(d => (d.safetyScore || 100) < 70).length;

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">👥</span>
          <div>
            <PageHeader 
              title="Driver Safety & Compliance" 
              description="Monitor driver licenses, safety scores, and performance"
            />
          </div>
        </div>

        {/* Safety Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-sm text-gray-600">Total Drivers</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{drivers.length}</p>
            <p className="text-xs text-green-600 mt-2">Active drivers</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-sm text-gray-600">Expired Licenses</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{expiredLicenses}</p>
            <p className="text-xs text-red-600 mt-2">Immediate action needed</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-sm text-gray-600">Expiring Soon</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">{expiringsoon}</p>
            <p className="text-xs text-yellow-600 mt-2">Within 30 days</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <p className="text-sm text-gray-600">Low Safety Scores</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">{lowSafetyScores}</p>
            <p className="text-xs text-orange-600 mt-2">Below 70/100</p>
          </div>
        </div>

        {/* Expired Licenses Alert */}
        {fetchError && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-6">
            <p className="text-red-700 font-semibold">Unable to load driver safety data</p>
            <p className="text-red-600 text-sm mt-1">{fetchError}</p>
          </div>
        )}

        {expiredLicenses > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">Drivers with Expired Licenses</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-red-100">
                    <th className="text-left py-3 px-4 font-semibold text-red-900">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-red-900">License Number</th>
                    <th className="text-left py-3 px-4 font-semibold text-red-900">Expiry Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-red-900">Days Expired</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.filter(d => isLicenseExpired(d.licenseExpiry)).map((driver) => (
                    <tr key={driver._id} className="border-b hover:bg-red-100">
                      <td className="py-3 px-4 font-semibold text-gray-900">{driver.name || 'N/A'}</td>
                      <td className="py-3 px-4 font-mono text-red-600">{driver.licenseNumber || 'N/A'}</td>
                      <td className="py-3 px-4">{new Date(driver.licenseExpiry).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-bold text-red-600">
                        {-getDaysUntilExpiry(driver.licenseExpiry)} days
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Drivers Table with Safety Metrics */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Details & Safety Metrics</h3>
          
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading drivers...</div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No drivers found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Driver Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">License Number</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">License Expiry</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">License Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Safety Score</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Speed Violations</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Accidents</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => {
                    const daysLeft = getDaysUntilExpiry(driver.licenseExpiry);
                    const isExpired = isLicenseExpired(driver.licenseExpiry);
                    return (
                      <tr key={driver._id} className={`border-b hover:bg-gray-50 ${isExpired ? 'bg-red-50' : ''}`}>
                        <td className="py-3 px-4 font-semibold text-gray-900">{driver.name || 'N/A'}</td>
                        <td className="py-3 px-4 font-mono text-blue-600">{driver.licenseNumber || 'N/A'}</td>
                        <td className="py-3 px-4">{driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString() : 'N/A'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getLicenseStatusColor(driver)}`}>
                            {isExpired ? 'Expired' : daysLeft < 30 ? 'Expiring Soon' : 'Valid'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-bold ${getSafetyScoreColor(driver.safetyScore)}`}>
                            {driver.safetyScore || 100}/100
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-gray-700">
                          {driver.overSpeedingIncidents || 0}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                            (driver.accidentHistory || 0) === 0 ? 'bg-green-100 text-green-800' :
                            (driver.accidentHistory || 0) < 3 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {driver.accidentHistory || 0}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Safety Scores Alert */}
        {lowSafetyScores > 0 && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-orange-800">Drivers with Low Safety Scores</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drivers.filter(d => (d.safetyScore || 100) < 70).map((driver) => (
                <div key={driver._id} className="bg-white p-4 rounded-lg border border-orange-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{driver.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{driver.licenseNumber}</p>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">{driver.safetyScore || 100}/100</span>
                  </div>
                  <div className="flex gap-4 text-sm mt-3 pt-3 border-t">
                    <span className="text-gray-700">Speed Violations: <strong>{driver.overSpeedingIncidents || 0}</strong></span>
                    <span className="text-gray-700">Accidents: <strong>{driver.accidentHistory || 0}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default SafetyOfficerDrivers;
