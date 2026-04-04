import React, { useEffect, useState } from 'react';
import { PageContainer, PageHeader } from '../../components/ui';
import { AlertTriangle, Wrench, CheckCircle } from 'lucide-react';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in_use':
        return 'bg-blue-100 text-blue-800';
      case 'in_shop':
        return 'bg-orange-100 text-orange-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🚗</span>
          <div>
            <PageHeader 
              title="Fleet Safety Status" 
              description="Monitor vehicle maintenance and safety conditions"
            />
          </div>
        </div>

        {/* Fleet Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-sm text-gray-600">Operational Vehicles</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {vehicles.filter(v => v.status === 'available').length}
            </p>
            <p className="text-xs text-green-600 mt-2">Ready for service</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <p className="text-sm text-gray-600">Maintenance Due</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">
              {vehicles.filter(v => v.maintenanceStatus === 'needs_maintenance').length}
            </p>
            <p className="text-xs text-orange-600 mt-2">Requires attention</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-sm text-gray-600">In Shop</p>
            <p className="text-3xl font-bold text-red-600 mt-1">
              {vehicles.filter(v => v.maintenanceStatus === 'in_shop').length}
            </p>
            <p className="text-xs text-red-600 mt-2">Currently servicing</p>
          </div>
        </div>

        {/* Vehicles Table */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Fleet Details</h3>

          {fetchError && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4">
              <p className="font-semibold text-red-700">Unable to load vehicle data</p>
              <p className="text-red-600 text-sm">{fetchError}</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading vehicles...</div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No vehicles found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">License Plate</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Vehicle Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Model</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Maintenance Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Last Serviced</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => {
                    const maintStatus = getMaintenanceStatus(vehicle);
                    return (
                      <tr key={vehicle._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono font-semibold text-blue-600">{vehicle.licensePlate}</td>
                        <td className="py-3 px-4 capitalize">{vehicle.vehicleType}</td>
                        <td className="py-3 px-4">{vehicle.model || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vehicle.status)}`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            maintStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                            maintStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {maintStatus.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">
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
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-800">Vehicles Requiring Attention</h3>
            </div>
            <div className="space-y-3">
              {vehicles.filter(v => v.maintenanceStatus === 'needs_maintenance' || v.maintenanceStatus === 'in_shop').map((vehicle) => (
                <div key={vehicle._id} className="bg-white p-4 rounded-lg border border-yellow-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{vehicle.licensePlate} - {vehicle.model}</p>
                      <p className="text-sm text-gray-600">{vehicle.vehicleType}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                      vehicle.maintenanceStatus === 'in_shop' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.maintenanceStatus === 'in_shop' ? 'In Shop' : 'Needs Maintenance'}
                    </span>
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
