import React, { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../hooks/useNotification';
import tripBaseURL from '../../api/tripBaseURL';
import { PageContainer, PageHeader } from '../../components/ui';
import { Clock, MapPin, Truck, Package, AlertCircle, CheckCircle, XCircle, ChevronDown } from 'lucide-react';

interface TripData {
  _id: string;
  vehiclePlateNumber: string;
  vehicle?: {
    name: string;
    licensePlate: string;
  };
  driverEmail: string;
  driver?: {
    user?: {
      name: string;
      email: string;
    };
  };
  cargoWeight: number;
  startLocation: string;
  endLocation: string;
  status: 'draft' | 'dispatched' | 'completed' | 'cancelled';
  revenue: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  expectedDeliveryDate?: string;
}

const DriverTripHistory: React.FC = () => {
  const { notifyError, notifySuccess } = useNotification();
  const [trips, setTrips] = useState<TripData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Fetch driver trips
  const fetchDriverTrips = useCallback(
    async (pageNum: number) => {
      setIsLoading(true);
      try {
        // Backend already filters trips by driver role, so no need for extra filtering
        const response = await tripBaseURL.get(`/get?page=${pageNum}&limit=10`);
        
        if (response.data?.success) {
          let driverTrips = response.data.data.trips || [];

          // Apply status filter on frontend (backend doesn't have status param)
          if (filterStatus !== 'all') {
            if (filterStatus === 'active') {
              driverTrips = driverTrips.filter((trip: TripData) => trip.status === 'dispatched');
            } else if (filterStatus === 'completed') {
              driverTrips = driverTrips.filter((trip: TripData) => trip.status === 'completed');
            } else if (filterStatus === 'cancelled') {
              driverTrips = driverTrips.filter((trip: TripData) => trip.status === 'cancelled');
            }
          }

          setTrips(driverTrips);
          setPagination({
            page: response.data.data.pagination?.page || pageNum,
            limit: response.data.data.pagination?.limit || 10,
            total: response.data.data.pagination?.total || 0,
            totalPages: response.data.data.pagination?.totalPages || 1,
          });
        } else {
          notifyError(response.data?.message || 'Failed to fetch trips');
          setTrips([]);
        }
      } catch (error: any) {
        const message = error.response?.data?.message || 'Error fetching trips';
        console.error('Trip fetch error:', error);
        notifyError(message);
        setTrips([]);
      } finally {
        setIsLoading(false);
      }
    },
    [filterStatus, notifyError]
  );

  // Initial load and when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  useEffect(() => {
    fetchDriverTrips(currentPage);
  }, [currentPage, fetchDriverTrips]);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dispatched':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'dispatched':
        return <Clock size={16} className="inline mr-1" />;
      case 'completed':
        return <CheckCircle size={16} className="inline mr-1 text-green-600" />;
      case 'cancelled':
        return <XCircle size={16} className="inline mr-1 text-red-600" />;
      default:
        return <AlertCircle size={16} className="inline mr-1" />;
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'dispatched':
        return 'In Transit';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Draft';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate trip duration
  const getTripDuration = (createdAt: string, completedAt?: string) => {
    const start = new Date(createdAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <PageContainer>
      <PageHeader
        Icon={Truck}
        title="My Trips"
        description="View your trip details, history, and status"
      />

      {/* Status Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        {(['all', 'active', 'completed', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === status
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading your trips...</p>
        </div>
      )}

      {/* No Trips State */}
      {!isLoading && trips.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
          <Truck size={48} className="mx-auto mb-3 text-blue-400 opacity-70" />
          <p className="text-lg font-semibold text-gray-800 mb-2">No trips found</p>
          <p className="text-gray-600">
            {filterStatus === 'all' ? 'You have no trips yet.' : `You have no ${filterStatus} trips.`}
          </p>
        </div>
      )}

      {/* Trips List */}
      <div className="space-y-4">
        {trips.map((trip) => (
          <div
            key={trip._id}
            className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition"
          >
            {/* Trip Header - Summary */}
            <div
              onClick={() => setExpandedTripId(expandedTripId === trip._id ? null : trip._id)}
              className="p-4 cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Route and Status */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="font-semibold">{trip.startLocation}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-semibold">{trip.endLocation}</span>
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(trip.status)} whitespace-nowrap`}>
                      {getStatusIcon(trip.status)}
                      {getStatusLabel(trip.status)}
                    </span>
                  </div>

                  {/* Vehicle, Cargo, and Date */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Vehicle</p>
                      <p className="font-semibold text-gray-800">{trip.vehicle?.name || trip.vehiclePlateNumber}</p>
                      <p className="text-xs text-gray-500">{trip.vehicle?.licensePlate || trip.vehiclePlateNumber}</p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs">Cargo Weight</p>
                      <p className="font-semibold text-gray-800">{trip.cargoWeight} kg</p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs">Revenue</p>
                      <p className="font-semibold text-green-600">₹{trip.revenue.toLocaleString('en-IN')}</p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs">Date</p>
                      <p className="font-semibold text-gray-800">{new Date(trip.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit'
                      })}</p>
                    </div>
                  </div>
                </div>

                {/* Expand Icon */}
                <ChevronDown
                  size={24}
                  className={`text-gray-400 transition transform ${expandedTripId === trip._id ? 'rotate-180' : ''}`}
                />
              </div>
            </div>

            {/* Trip Details - Expanded */}
            {expandedTripId === trip._id && (
              <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
                {/* Trip Timeline */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock size={16} className="text-blue-600" />
                    Trip Timeline
                  </h4>

                  <div className="space-y-3">
                    {/* Created */}
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-blue-600 mt-2"></div>
                        <div className="w-0.5 h-12 bg-gray-300 absolute left-1 top-5"></div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600">TRIP CREATED</p>
                        <p className="text-sm text-gray-800 font-medium">{formatDate(trip.createdAt)}</p>
                      </div>
                    </div>

                    {/* Dispatched/In Transit */}
                    {(trip.status === 'dispatched' || trip.status === 'completed') && (
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div className="w-3 h-3 rounded-full bg-blue-600 mt-2"></div>
                          <div className={`w-0.5 ${trip.status === 'completed' ? 'h-12' : 'h-0'} bg-gray-300 absolute left-1 top-5`}></div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600">IN TRANSIT</p>
                          <p className="text-sm text-gray-800 font-medium">{formatDate(trip.updatedAt)}</p>
                          <p className="text-xs text-gray-500">Duration: {getTripDuration(trip.createdAt, trip.completedAt)}</p>
                        </div>
                      </div>
                    )}

                    {/* Completed */}
                    {trip.status === 'completed' && trip.completedAt && (
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div className="w-3 h-3 rounded-full bg-green-600 mt-2"></div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600">COMPLETED</p>
                          <p className="text-sm text-gray-800 font-medium">{formatDate(trip.completedAt)}</p>
                        </div>
                      </div>
                    )}

                    {/* Cancelled */}
                    {trip.status === 'cancelled' && (
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div className="w-3 h-3 rounded-full bg-red-600 mt-2"></div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600">CANCELLED</p>
                          <p className="text-sm text-gray-800 font-medium">{formatDate(trip.updatedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Route Details */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <MapPin size={16} className="text-blue-600" />
                      Route
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">From</p>
                        <p className="text-gray-800 font-semibold">{trip.startLocation}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">To</p>
                        <p className="text-gray-800 font-semibold">{trip.endLocation}</p>
                      </div>
                      {trip.expectedDeliveryDate && (
                        <div>
                          <p className="text-gray-500 text-xs">Expected Delivery</p>
                          <p className="text-gray-800 font-semibold">{formatDate(trip.expectedDeliveryDate)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cargo Details */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Package size={16} className="text-blue-600" />
                      Cargo
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Weight</p>
                        <p className="text-gray-800 font-semibold">{trip.cargoWeight} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Revenue</p>
                        <p className="text-green-600 font-semibold">₹{trip.revenue.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Trip ID</p>
                        <p className="text-gray-800 font-mono text-xs">{trip._id.slice(-8)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 col-span-2 md:col-span-1">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Truck size={16} className="text-blue-600" />
                      Vehicle
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Name</p>
                        <p className="text-gray-800 font-semibold">{trip.vehicle?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">License Plate</p>
                        <p className="text-gray-800 font-semibold">{trip.vehicle?.licensePlate || trip.vehiclePlateNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Info */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 col-span-2 md:col-span-1">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <AlertCircle size={16} className="text-blue-600" />
                      Status
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Current Status</p>
                        <p className={`font-bold px-2 py-1 rounded w-fit text-xs border ${getStatusColor(trip.status)}`}>
                          {getStatusIcon(trip.status)}
                          {getStatusLabel(trip.status)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg font-medium transition ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
            disabled={currentPage === pagination.totalPages}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </PageContainer>
  );
};

export default DriverTripHistory;
