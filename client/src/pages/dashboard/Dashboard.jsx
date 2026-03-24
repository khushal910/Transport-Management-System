import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import dashboardBaseURL from '../../api/dashboardBaseURL';
import DashboardKPIs from '../../components/DashboardKPIs';

const TRIP_STATUS_COLORS = {
  dispatched: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const TRIP_STATUS_LABELS = {
  dispatched: 'Dispatched',
  completed: 'Completed',
  draft: 'Draft',
  cancelled: 'Cancelled',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [filterState, setFilterState] = useState({
    vehicleType: '',
    status: '',
  });
  const [sortState, setSortState] = useState({
    field: 'tripId',
    order: 'desc',
  });
  const [appliedSort, setAppliedSort] = useState({
    field: 'tripId',
    order: 'desc',
  });
  const [groupByState, setGroupByState] = useState('');
  const [appliedGroupBy, setAppliedGroupBy] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filterMenuRef = useRef();
  const sortMenuRef = useRef();
  const groupMenuRef = useRef();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterPanel(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortPanel(false);
      }
      if (groupMenuRef.current && !groupMenuRef.current.contains(event.target)) {
        setShowGroupPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (filters = {}) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.vehicleType) params.append('vehicleType', filters.vehicleType);
      if (filters.status) params.append('status', filters.status);

      const response = await dashboardBaseURL.get('/kpis', { params });

      if (response.data?.success) {
        const data = response.data.data;
        setKpis(data.kpis);
        setTrips(data.trips);
      } else {
        toast.error(response.data?.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterState((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    setShowFilterPanel(false);
    fetchDashboardData(filterState);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilterState({ vehicleType: '', status: '' });
    setShowFilterPanel(false);
    fetchDashboardData({});
  };

  // Handle sort
  const handleSortChange = (e) => {
    const { name, value } = e.target;
    setSortState((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplySort = () => {
    setAppliedSort(sortState);
    setShowSortPanel(false);
  };

  const handleClearSort = () => {
    setSortState({ field: 'tripId', order: 'desc' });
    setAppliedSort({ field: 'tripId', order: 'desc' });
    setShowSortPanel(false);
  };

  // Handle grouping
  const handleApplyGroup = () => {
    setAppliedGroupBy(groupByState);
    setShowGroupPanel(false);
  };

  const handleClearGroup = () => {
    setGroupByState('');
    setAppliedGroupBy('');
    setShowGroupPanel(false);
  };

  // Handle KPI card navigation
  const handleKPICardClick = (cardId) => {
    switch (cardId) {
      case 'activeFleet':
        navigate('/main/vehicle-registry');
        break;
      case 'maintenanceAlerts':
        navigate('/main/maintenance');
        break;
      case 'pendingCargo':
        navigate('/main/trip-dispatcher');
        break;
      default:
        break;
    }
  };

  // Filter and search trips
  let filteredTrips = trips.filter((trip) => {
    const searchableText = [
      trip.tripNumber,
      trip.vehicle.licensePlate,
      trip.driver.name,
      trip.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(searchTerm.toLowerCase());
  });

  // Sort trips
  if (appliedSort.field) {
    filteredTrips.sort((a, b) => {
      let aVal, bVal;

      if (appliedSort.field === 'tripId') {
        aVal = a.tripNumber;
        bVal = b.tripNumber;
      } else if (appliedSort.field === 'vehicle') {
        aVal = a.vehicle.licensePlate;
        bVal = b.vehicle.licensePlate;
      } else if (appliedSort.field === 'driver') {
        aVal = a.driver.name;
        bVal = b.driver.name;
      } else if (appliedSort.field === 'status') {
        aVal = a.status;
        bVal = b.status;
      }

      if (appliedSort.order === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }

  // Group trips if needed
  let displayTrips = filteredTrips;
  const groupedTrips = {};
  if (appliedGroupBy) {
    filteredTrips.forEach((trip) => {
      let groupKey;
      if (appliedGroupBy === 'status') {
        groupKey = TRIP_STATUS_LABELS[trip.status] || trip.status;
      } else if (appliedGroupBy === 'vehicleType') {
        groupKey = trip.vehicle.vehicleType || 'Unknown';
      }
      if (!groupedTrips[groupKey]) groupedTrips[groupKey] = [];
      groupedTrips[groupKey].push(trip);
    });
    displayTrips = groupedTrips;
  }

  const hasActiveFilters = filterState.vehicleType !== '' || filterState.status !== '';
  const hasActiveSort = appliedSort.field !== 'tripId' || appliedSort.order !== 'desc';
  const hasActiveGroup = Boolean(appliedGroupBy);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fleet Flow</h1>
        <p className="text-gray-600">Real-time fleet visibility and operations dashboard</p>
      </div>

      {/* KPI Cards */}
      <DashboardKPIs kpis={kpis} isLoading={isLoading} onCardClick={handleKPICardClick} />

      {/* Search and Filter Controls */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by Trip ID, Vehicle, or Driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* Control Buttons */}
          <div className="flex gap-2">
            {/* Group By Button */}
            <div className="relative" ref={groupMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setShowGroupPanel((prev) => !prev);
                  setShowFilterPanel(false);
                  setShowSortPanel(false);
                }}
                className={`px-4 py-2 text-white rounded hover:opacity-90 transition ${
                  hasActiveGroup ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                Group by
              </button>

              {showGroupPanel && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-20 p-3 space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Group By
                    </label>
                    <select
                      value={groupByState}
                      onChange={(e) => setGroupByState(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">None</option>
                      <option value="status">Status</option>
                      <option value="vehicleType">Vehicle Type</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleApplyGroup}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
                    >
                      Apply
                    </button>
                    <button
                      onClick={handleClearGroup}
                      className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-400 transition"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Filter Button */}
            <div className="relative" ref={filterMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setShowFilterPanel((prev) => !prev);
                  setShowSortPanel(false);
                  setShowGroupPanel(false);
                }}
                className={`px-4 py-2 text-white rounded hover:opacity-90 transition ${
                  hasActiveFilters ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                Filter
              </button>

              {showFilterPanel && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded shadow-lg z-20 p-4 space-y-4">
                  {/* Vehicle Type Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vehicle Type
                    </label>
                    <select
                      name="vehicleType"
                      value={filterState.vehicleType}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Types</option>
                      <option value="truck">Truck</option>
                      <option value="van">Van</option>
                      <option value="bike">Bike</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Trip Status
                    </label>
                    <select
                      name="status"
                      value={filterState.status}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Apply/Clear Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleApplyFilters}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
                    >
                      Apply Filter
                    </button>
                    <button
                      onClick={handleClearFilters}
                      className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-400 transition"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort By Button */}
            <div className="relative" ref={sortMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setShowSortPanel((prev) => !prev);
                  setShowFilterPanel(false);
                  setShowGroupPanel(false);
                }}
                className={`px-4 py-2 text-white rounded hover:opacity-90 transition ${
                  hasActiveSort ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                Sort by...
              </button>

              {showSortPanel && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-20 p-3 space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sort Field
                    </label>
                    <select
                      name="field"
                      value={sortState.field}
                      onChange={handleSortChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="tripId">Trip ID</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="driver">Driver</option>
                      <option value="status">Status</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Order
                    </label>
                    <select
                      name="order"
                      value={sortState.order}
                      onChange={handleSortChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleApplySort}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
                    >
                      Apply
                    </button>
                    <button
                      onClick={handleClearSort}
                      className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-400 transition"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* New Trip / New Vehicle Buttons */}
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              + New Trip
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              + New Vehicle
            </button>
          </div>
        </div>
      </div>

      {/* Trips Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            Loading trips...
          </div>
        </div>
      ) : appliedGroupBy ? (
        // Grouped View
        <div className="space-y-6">
          {Object.entries(displayTrips).map(([groupKey, groupTrips]) => (
            <div key={groupKey} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Group Header */}
              <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">
                  {groupKey} ({groupTrips.length})
                </h3>
              </div>

              {/* Group Table */}
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                      Trip
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                      Vehicle
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                      Driver
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupTrips.map((trip, idx) => (
                    <tr
                      key={trip.tripId}
                      className={`border-b hover:bg-blue-50 cursor-pointer transition ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-800">{trip.tripNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {trip.vehicle.licensePlate}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">{trip.driver.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            TRIP_STATUS_COLORS[trip.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {TRIP_STATUS_LABELS[trip.status] || trip.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        // Standard Table View
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                  Trip
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                  Vehicle
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                  Driver
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.length > 0 ? (
                filteredTrips.map((trip, idx) => (
                  <tr
                    key={trip.tripId}
                    className={`border-b hover:bg-blue-50 cursor-pointer transition ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-800">{trip.tripNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <div>{trip.vehicle.licensePlate}</div>
                      <div className="text-xs text-gray-500">{trip.vehicle.vehicleType}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">{trip.driver.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          TRIP_STATUS_COLORS[trip.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {TRIP_STATUS_LABELS[trip.status] || trip.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-12 text-center text-gray-500">
                    No trips found with the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {!isLoading && filteredTrips.length > 0 && (
        <div className="mt-6 text-sm text-gray-600">
          Showing {filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''}
          {appliedGroupBy && ` grouped by ${appliedGroupBy}`}
        </div>
      )}
    </div>
  );
};

export default Dashboard;