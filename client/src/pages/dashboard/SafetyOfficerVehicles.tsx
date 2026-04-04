import { useEffect, useState } from 'react';
import { PageContainer, PageHeader } from '../../components/ui';
import { AlertTriangle, Wrench, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import safetyBaseURL from '../../api/safetyBaseURL';
import { useNotification } from '../../hooks/useNotification';

/**
 * Safety Officer - Vehicles View
 * Shows maintenance status and safety conditions of vehicles
 */
export const SafetyOfficerVehicles = () => {
  const { notifyError } = useNotification();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await safetyBaseURL.get('/metrics');
        if (response.data?.success) {
          setVehicles([
            {
              _id: '1',
              licensePlate: 'KL-01-AB-1234',
              vehicleType: 'truck',
              model: 'Tata 1412',
              status: 'available',
              maintenanceStatus: 'operational',
              lastServiceDate: '2024-01-10',
            },
            {
              _id: '2',
              licensePlate: 'KL-01-CD-5678',
              vehicleType: 'van',
              model: 'Maruti Suzuki',
              status: 'available',
              maintenanceStatus: 'needs_maintenance',
              lastServiceDate: '2023-12-15',
            },
            {
              _id: '3',
              licensePlate: 'KL-01-EF-9012',
              vehicleType: 'truck',
              model: 'Ashok Leyland',
              status: 'in_use',
              maintenanceStatus: 'in_shop',
              lastServiceDate: '2024-01-05',
            },
          ]);
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
    fetchVehicles();
  }, [notifyError]);

  const getMaintenanceStatus = (vehicle: any) => {
    if (vehicle.maintenanceStatus === 'in_shop') return { label: 'In Shop', color: 'orange' };
    if (vehicle.maintenanceStatus === 'needs_maintenance') return { label: 'Needs Maintenance', color: 'red' };
    return { label: 'Operational', color: 'green' };
  };


  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header Section */}
        <div>
          <PageHeader 
            title="Fleet Safety & Maintenance Management" 
            description="Monitor vehicle maintenance schedules, safety conditions, and operational status"
          />
        </div>

        {/* Fleet Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Operational Vehicles */}
          <div className="bg-white border border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Operational Vehicles</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {vehicles.filter(v => v.maintenanceStatus === 'operational').length}
                </p>
                <p className="text-xs text-green-600 mt-3">Ready for immediate use</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            {vehicles.length > 0 && (
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{width: `${(vehicles.filter(v => v.maintenanceStatus === 'operational').length / vehicles.length) * 100}%`}}
                ></div>
              </div>
            )}
          </div>

          {/* Maintenance Due */}
          <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance Due</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">
                  {vehicles.filter(v => v.maintenanceStatus === 'needs_maintenance').length}
                </p>
                <p className="text-xs text-amber-600 mt-3">Scheduled maintenance pending</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <Wrench className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          {/* In Shop */}
          <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Currently in Service</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {vehicles.filter(v => v.maintenanceStatus === 'in_shop').length}
                </p>
                <p className="text-xs text-blue-600 mt-3">Active maintenance in progress</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {fetchError && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-900 font-semibold">Unable to load vehicle data</p>
              <p className="text-red-700 text-sm mt-1">{fetchError}</p>
            </div>
          </div>
        )}

        {/* Fleet Details Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Complete Fleet Inventory</h3>
            <p className="text-sm text-gray-600 mt-1">All vehicles with current maintenance and operational status</p>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p>Loading vehicle data...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Truck className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No vehicles found in the system</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">License Plate</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Vehicle Type</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Model</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Maintenance</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Last Serviced</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => {
                    const maintStatus = getMaintenanceStatus(vehicle);
                    return (
                      <tr key={vehicle._id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                        <td className="py-4 px-6 font-mono font-semibold text-blue-600">{vehicle.licensePlate}</td>
                        <td className="py-4 px-6 text-gray-900 capitalize font-medium">{vehicle.vehicleType}</td>
                        <td className="py-4 px-6 text-gray-600">{vehicle.model || 'N/A'}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            vehicle.status === 'available' ? 'bg-green-100 text-green-700' :
                            vehicle.status === 'in_use' ? 'bg-blue-100 text-blue-700' :
                            vehicle.status === 'in_shop' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {vehicle.status === 'available' ? '✓ Available' :
                             vehicle.status === 'in_use' ? '🚗 In Use' :
                             vehicle.status === 'in_shop' ? '🔧 In Shop' :
                             vehicle.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            maintStatus.color === 'green' ? 'bg-green-100 text-green-700' :
                            maintStatus.color === 'orange' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {maintStatus.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center text-gray-600">
                          {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Vehicles Requiring Attention */}
        {vehicles.some(v => v.maintenanceStatus === 'needs_maintenance' || v.maintenanceStatus === 'in_shop') && (
          <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">⚠️ Vehicles Requiring Attention</h3>
              <span className="ml-auto bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold">
                {vehicles.filter(v => v.maintenanceStatus === 'needs_maintenance' || v.maintenanceStatus === 'in_shop').length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {vehicles.filter(v => v.maintenanceStatus === 'needs_maintenance' || v.maintenanceStatus === 'in_shop').map((vehicle) => (
                <div key={vehicle._id} className="bg-linear-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200 hover:shadow-md transition">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{vehicle.licensePlate}</p>
                      <p className="text-sm text-gray-600">{vehicle.model} • {vehicle.vehicleType}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last serviced: {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                        vehicle.maintenanceStatus === 'in_shop' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {vehicle.maintenanceStatus === 'in_shop' ? '🔧 In Shop' : '⚠️ Needs Maintenance'}
                      </span>
                    </div>
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

export default SafetyOfficerVehicles;
