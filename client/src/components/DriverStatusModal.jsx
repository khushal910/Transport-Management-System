import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaHistory, FaTimes, FaCircle } from 'react-icons/fa';
import driverStatusBaseURL from '../api/driverStatusBaseURL';

export default function DriverStatusModal({ driverId, driverName, onClose, onStatusUpdated }) {
  const [currentStatus, setCurrentStatus] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('status'); // 'status' or 'history'

  const statusColors = {
    available: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    off_duty: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' },
    on_trip: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    suspended: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  };

  const statusLabels = {
    available: 'Available (On Duty)',
    off_duty: 'Off Duty',
    on_trip: 'On Trip',
    suspended: 'Suspended',
  };

  const availableTransitions = {
    available: ['off_duty', 'suspended'],
    off_duty: ['available', 'suspended'],
    on_trip: [],
    suspended: ['available', 'off_duty'],
  };

  // Fetch driver status and history
  useEffect(() => {
    if (driverId) {
      fetchStatusHistory();
    } else {
      toast.error('Driver ID is missing');
    }
  }, [driverId]);

  const fetchStatusHistory = async () => {
    try {
      setIsLoading(true);
      const response = await driverStatusBaseURL.get(`/history/${driverId}`);
      if (response.data.success) {
        setCurrentStatus(response.data.data.currentStatus);
        setStatusHistory(response.data.data.statusHistory || []);
      } else {
        toast.error(response.data?.message || 'Failed to load driver status');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load driver status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) {
      toast.info('Driver already has this status');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await driverStatusBaseURL.post(`/${driverId}`, {
        status: newStatus,
      });

      if (response.data.success) {
        setCurrentStatus(newStatus);
        toast.success(response.data.message);
        onStatusUpdated?.();
        // Refresh history
        await fetchStatusHistory();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    return statusColors[status] || { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
  };

  const getReasonLabel = (reason) => {
    const reasons = {
      manual_update: 'Manual Update',
      automatic_trip_assign: 'Trip Assignment',
      automatic_trip_complete: 'Trip Completed',
      automatic_trip_cancel: 'Trip Cancelled',
      automatic_trip_update_driver_change: 'Trip Driver Changed',
      automatic_trip_update_driver_assign: 'Trip Driver Reassigned',
    };
    return reasons[reason] || reason;
  };

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Close when clicking outside the modal (on the backdrop)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Driver Status Management</h2>
            <p className="text-gray-500 text-sm mt-1">{driverName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
            title="Close"
          >
            <FaTimes className="text-xl text-gray-600 hover:text-gray-900" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            Loading status information...
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b bg-gray-50">
              <button
                onClick={() => setActiveTab('status')}
                className={`flex-1 px-4 py-4 font-medium transition duration-200 ${
                  activeTab === 'status'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Update Status
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 px-4 py-4 font-medium transition duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'history'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaHistory className="text-sm" />
                History
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'status' ? (
                <div className="space-y-6">
                  {/* Current Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                    <div className={`px-4 py-3 rounded-lg font-semibold text-center ${getStatusColor(currentStatus).bg} ${getStatusColor(currentStatus).text}`}>
                      {statusLabels[currentStatus]}
                    </div>
                  </div>

                  {/* Status Change Section */}
                  {currentStatus === 'on_trip' ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-700">
                        <strong>Info:</strong> Driver is on a trip. Status will update automatically when trip completes.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Change Status To</label>
                      <div className="space-y-2">
                        {availableTransitions[currentStatus]?.length > 0 ? (
                          availableTransitions[currentStatus].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(status)}
                              disabled={isUpdating}
                              className={`w-full px-4 py-2.5 rounded-lg font-medium transition duration-200 ${
                                getStatusColor(status).bg
                              } ${getStatusColor(status).text} hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {statusLabels[status]}
                            </button>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4 text-sm">No status changes available.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg">Status Change History</h3>
                  {statusHistory.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FaHistory className="text-4xl mx-auto mb-3 opacity-30" />
                      <p>No status changes recorded yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {statusHistory.map((record, idx) => (
                        <div
                          key={idx}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition duration-200 bg-white"
                        >
                          {/* Change Arrow */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.fromStatus).bg} ${getStatusColor(record.fromStatus).text}`}>
                              {statusLabels[record.fromStatus]}
                            </span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.toStatus).bg} ${getStatusColor(record.toStatus).text}`}>
                              {statusLabels[record.toStatus]}
                            </span>
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 text-xs font-medium">REASON</p>
                              <p className="text-gray-900 font-medium mt-1">{getReasonLabel(record.reason)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs font-medium">CHANGED BY</p>
                              <p className="text-gray-900 font-medium mt-1">
                                {typeof record.changedBy === 'string' 
                                  ? record.changedBy 
                                  : record.changedBy?.name || 'System'}
                              </p>
                            </div>
                          </div>

                          {/* Timestamp */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              {new Date(record.changedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition duration-200"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
