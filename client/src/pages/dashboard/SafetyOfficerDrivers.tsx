import { useEffect, useState } from 'react';
import { PageContainer, PageHeader } from '../../components/ui';
import { AlertTriangle, AlertCircle, Users, Calendar, TrendingDown, CheckCircle2 } from 'lucide-react';
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

  // Summary stats
  const expiredLicenses = drivers.filter(d => isLicenseExpired(d.licenseExpiry)).length;
  const expiringsoon = drivers.filter(d => !isLicenseExpired(d.licenseExpiry) && getDaysUntilExpiry(d.licenseExpiry) < 30).length;
  const lowSafetyScores = drivers.filter(d => (d.safetyScore || 100) < 70).length;

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header Section */}
        <div>
          <PageHeader 
            title="Driver Safety & Compliance Management" 
            description="Real-time monitoring of driver safety metrics, license status, and compliance records"
          />
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Drivers Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Active Drivers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{drivers.length}</p>
                <p className="text-xs text-gray-500 mt-3">All registered drivers</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Expired Licenses Card */}
          <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired Licenses</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{expiredLicenses}</p>
                <p className="text-xs text-red-500 mt-3">Requires immediate action</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            {drivers.length > 0 && (
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{width: `${(expiredLicenses / drivers.length) * 100}%`}}
                ></div>
              </div>
            )}
          </div>

          {/* Expiring Soon Card */}
          <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Licenses Expiring Soon</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{expiringsoon}</p>
                <p className="text-xs text-amber-600 mt-3">Within 30 days</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Low Safety Scores Card */}
          <div className="bg-white border border-orange-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Safety Scores</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{lowSafetyScores}</p>
                <p className="text-xs text-orange-600 mt-3">Score &lt; 70/100</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {fetchError && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-900 font-semibold">Unable to load driver data</p>
              <p className="text-red-700 text-sm mt-1">{fetchError}</p>
            </div>
          </div>
        )}

        {/* Expired Licenses Alert Section */}
        {expiredLicenses > 0 && (
          <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">⚠️ Expired Licenses - Immediate Action Required</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Driver Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">License ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Expiry Date</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Days Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.filter(d => isLicenseExpired(d.licenseExpiry)).map((driver) => (
                    <tr key={driver._id} className="border-b border-gray-100 hover:bg-red-50 transition">
                      <td className="py-3 px-4 text-gray-900 font-medium">{driver.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600 font-mono text-sm">{driver.licenseNumber || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600">{new Date(driver.licenseExpiry).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                          {-getDaysUntilExpiry(driver.licenseExpiry)} days
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Drivers Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Drivers - Safety Compliance Status</h3>
            <p className="text-sm text-gray-600 mt-1">Complete list of all drivers with license and safety metrics</p>
          </div>
          
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p>Loading driver data...</p>
            </div>
          ) : drivers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No drivers found in the system</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Driver Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">License Expiry</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">License Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Safety Score</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => {
                    const daysLeft = getDaysUntilExpiry(driver.licenseExpiry);
                    const isExpired = isLicenseExpired(driver.licenseExpiry);
                    const safetyScore = driver.safetyScore || 100;
                    const scoreStatus = safetyScore >= 80 ? 'excellent' : safetyScore >= 60 ? 'fair' : 'poor';
                    
                    return (
                      <tr key={driver._id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                        <td className="py-4 px-6 text-gray-900 font-medium">{driver.name || 'N/A'}</td>
                        <td className="py-4 px-6 text-gray-600">
                          {driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {isExpired ? (
                            <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                              Expired
                            </span>
                          ) : daysLeft < 30 ? (
                            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                              Expiring Soon
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold w-fit mx-auto">
                              <CheckCircle2 className="h-3 w-3" /> Valid
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`text-lg font-bold ${
                              scoreStatus === 'excellent' ? 'text-green-600' :
                              scoreStatus === 'fair' ? 'text-amber-600' :
                              'text-red-600'
                            }`}>
                              {safetyScore}
                            </span>
                            <span className="text-xs text-gray-500">/100</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">View Details</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Safety Scores Section */}
        {lowSafetyScores > 0 && (
          <div className="bg-white border border-orange-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <TrendingDown className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">⚠️ Drivers with Low Safety Scores</h3>
              <span className="ml-auto bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                {lowSafetyScores} driver{lowSafetyScores !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {drivers.filter(d => (d.safetyScore || 100) < 70).map((driver) => {
                const safetyScore = driver.safetyScore || 100;
                const scorePercentage = (safetyScore / 100) * 100;
                return (
                  <div key={driver._id} className="bg-linear-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200 hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{driver.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{driver.licenseNumber || 'N/A'}</p>
                      </div>
                      <span className="text-lg font-bold text-red-600">{safetyScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-linear-to-r from-amber-500 to-red-600 h-2 rounded-full transition-all duration-300"
                        style={{width: `${scorePercentage}%`}}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default SafetyOfficerDrivers;
