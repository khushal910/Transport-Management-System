import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import tripBaseURL from '../../api/tripBaseURL.js';
import expenseBaseURL from '../../api/expenseBaseURL.js';

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filteredGroupedExpenses, setFilteredGroupedExpenses] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGroupedView, setIsGroupedView] = useState(false);

  // Form state
  const [expenseForm, setExpenseForm] = useState({
    tripId: '',
    tripSearch: '',
    fuelCost: '',
    miscExpense: '',
    distance: '',
  });

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter & Sort state
  const [filterState, setFilterState] = useState({
    status: '',
    startDate: '',
    endDate: '',
    minCost: '',
    maxCost: '',
  });
  const [sortState, setSortState] = useState({ field: 'date', order: 'desc' });
  const [appliedFilters, setAppliedFilters] = useState({});
  const [appliedSort, setAppliedSort] = useState({ field: 'date', order: 'desc' });
  const [appliedGroupBy, setAppliedGroupBy] = useState('');

  // Refs for closing dropdowns
  const filterMenuRef = useRef(null);
  const sortMenuRef = useRef(null);
  const groupMenuRef = useRef(null);

  // Available trips for autocomplete
  const [availableTrips, setAvailableTrips] = useState([]);
  const [tripSuggestions, setTripSuggestions] = useState([]);
  const [showTripSuggestions, setShowTripSuggestions] = useState(false);
  const tripInputRef = useRef(null);

  const normalizeExpense = (expense) => ({
    ...expense,
    tripIdShort: expense.tripId?.slice(-3) || expense.tripId || 'N/A',
  });

  const isExpenseMatchingSearch = (expense, query) => {
    if (!query.trim()) return true;
    const lowerQuery = query.toLowerCase();
    return (
      expense.tripIdShort?.toLowerCase()?.includes(lowerQuery) ||
      expense.driverName?.toLowerCase()?.includes(lowerQuery) ||
      expense.vehicleName?.toLowerCase()?.includes(lowerQuery) ||
      expense.status?.toLowerCase()?.includes(lowerQuery)
    );
  };
  // Fetch expenses
  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: 1,
        limit: 100,
        sort: `${appliedSort.field}:${appliedSort.order}`,
        ...(appliedGroupBy && { groupBy: appliedGroupBy }),
        ...appliedFilters,
      });

      const response = await expenseBaseURL.get(`/list?${queryParams}`);
      if (response.data.success) {
        let data = response.data.data.expenses;

        // Normalize all expenses
        if (Array.isArray(data)) {
          data = data.map(normalizeExpense);
          setExpenses(data);
          const filtered = data.filter((e) => isExpenseMatchingSearch(e, searchQuery));
          setFilteredExpenses(filtered);
          setFilteredGroupedExpenses({});
          setIsGroupedView(false);
        } else if (typeof data === 'object') {
          // Grouped data
          setExpenses([]);
          const normalized = {};
          Object.entries(data).forEach(([key, items]) => {
            normalized[key] = items.map(normalizeExpense);
          });
          setFilteredGroupedExpenses(normalized);
          setIsGroupedView(true);
        }
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to fetch expenses: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [appliedSort, appliedGroupBy, appliedFilters, searchQuery]);

  // Fetch available trips for autocomplete
  const fetchAvailableTrips = useCallback(async () => {
    try {
      const response = await tripBaseURL.get('/get?page=1&limit=100');
      if (response.data.success && response.data.data?.trips) {
        setAvailableTrips(response.data.data.trips);
        console.log('Trips loaded:', response.data.data.trips);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    fetchAvailableTrips();
  }, [fetchAvailableTrips]);

  // Search filter
  useEffect(() => {
    if (!isGroupedView) {
      const filtered = expenses.filter((e) => isExpenseMatchingSearch(e, searchQuery));
      setFilteredExpenses(filtered);
    }
  }, [searchQuery, expenses, isGroupedView]);

  // Close modal when clicking outside
  const handleCloseModal = (event) => {
    if (event.target === event.currentTarget) {
      setShowModal(false);
      setShowTripSuggestions(false);
      setTripSuggestions([]);
    }
  };

  // Handle form input
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm((prev) => ({ ...prev, [name]: value }));

    // Handle trip search
    if (name === 'tripSearch') {
      if (value.trim()) {
        const filtered = availableTrips.filter((trip) => {
          const tripDriver = trip.driver?.user?.name || trip.driverName || '';
          const tripVehicle = trip.vehicle?.name || trip.vehicle?.licensePlate || trip.vehiclePlateNumber || '';
          const searchText = (
            trip._id +
            ' ' +
            (trip.startLocation || '') +
            ' ' +
            (trip.endLocation || '') +
            ' ' +
            tripDriver +
            ' ' +
            tripVehicle
          ).toLowerCase();
          return searchText.includes(value.toLowerCase());
        });
        setTripSuggestions(filtered);
        setShowTripSuggestions(true);
      } else {
        setTripSuggestions([]);
        setShowTripSuggestions(false);
      }
    }
  };

  // Select trip from suggestions
  const selectTrip = (trip) => {
    setExpenseForm((prev) => ({
      ...prev,
      tripId: trip._id,
      tripSearch: `${trip.startLocation} → ${trip.endLocation} (${trip.driver?.user?.name || 'N/A'})`,
    }));
    setShowTripSuggestions(false);
    setTripSuggestions([]);
  };

  // Validate form
  const validateForm = () => {
    if (!expenseForm.tripId) {
      toast.error('Trip ID is required');
      return false;
    }
    if (!expenseForm.fuelCost) {
      toast.error('Fuel Cost is required');
      return false;
    }
    if (isNaN(expenseForm.fuelCost) || Number(expenseForm.fuelCost) < 0) {
      toast.error('Fuel Cost must be a valid positive number');
      return false;
    }
    if (expenseForm.miscExpense && (isNaN(expenseForm.miscExpense) || Number(expenseForm.miscExpense) < 0)) {
      toast.error('Misc Expense must be a valid positive number');
      return false;
    }
    if (expenseForm.distance && (isNaN(expenseForm.distance) || Number(expenseForm.distance) < 0)) {
      toast.error('Distance must be a valid positive number');
      return false;
    }
    return true;
  };

  // Create expense
  const handleCreateExpense = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        tripId: expenseForm.tripId,
        fuelCost: Number(expenseForm.fuelCost),
        miscExpense: Number(expenseForm.miscExpense) || 0,
        distance: expenseForm.distance ? Number(expenseForm.distance) : undefined,
      };

      const response = await expenseBaseURL.post('/create', payload);
      if (response.data.success) {
        toast.success('Expense created successfully');
        setExpenseForm({ tripId: '', tripSearch: '', fuelCost: '', miscExpense: '', distance: '' });
        setShowModal(false);
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Failed to create expense: ' + (error.response?.data?.message || error.message));
    }
  };

  // Filter handlers
  const handleApplyFilters = () => {
    setAppliedFilters(filterState);
    setShowFilterPanel(false);
  };

  const handleClearFilters = () => {
    setFilterState({ status: '', startDate: '', endDate: '', minCost: '', maxCost: '' });
    setAppliedFilters({});
  };

  // Sort handler
  const handleApplySort = () => {
    setAppliedSort(sortState);
    setShowSortPanel(false);
  };

  // Group handlers
  const handleApplyGroupBy = (groupType) => {
    setAppliedGroupBy(groupType);
    setShowGroupPanel(false);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target))
        setShowFilterPanel(false);
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target))
        setShowSortPanel(false);
      if (groupMenuRef.current && !groupMenuRef.current.contains(e.target))
        setShowGroupPanel(false);
      if (tripInputRef.current && !tripInputRef.current.contains(e.target))
        setShowTripSuggestions(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };



  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Expense & Fuel Logging</h1>
        <p className="text-gray-600 text-sm mt-1">Track your fleet's fuel costs and miscellaneous expenses</p>
      </div>

      {/* Top Action Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-3 items-center flex-wrap">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by Trip ID, Driver, Vehicle, or Status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Filter Button */}
          <div className="relative" ref={filterMenuRef}>
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`px-4 py-2 rounded-lg font-medium text-white ${
                Object.keys(appliedFilters).length > 0
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              Filter {Object.keys(appliedFilters).length > 0 && '✓'}
            </button>

            {showFilterPanel && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-64 p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filterState.status}
                    onChange={(e) => setFilterState({ ...filterState, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cost Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filterState.minCost}
                      onChange={(e) => setFilterState({ ...filterState, minCost: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filterState.maxCost}
                      onChange={(e) => setFilterState({ ...filterState, maxCost: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleApplyFilters}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
                  >
                    Apply
                  </button>
                  <button
                    onClick={handleClearFilters}
                    className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-400 text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sort Button */}
          <div className="relative" ref={sortMenuRef}>
            <button
              onClick={() => setShowSortPanel(!showSortPanel)}
              className={`px-4 py-2 rounded-lg font-medium text-white ${
                appliedSort.field !== 'date'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              Sort {appliedSort.field !== 'date' && '✓'}
            </button>
            {showSortPanel && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-48 p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Field</label>
                  <select
                    value={sortState.field}
                    onChange={(e) => setSortState({ ...sortState, field: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="date">Date</option>
                    <option value="fuelCost">Fuel Cost</option>
                    <option value="totalCost">Total Cost</option>
                    <option value="distance">Distance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <select
                    value={sortState.order}
                    onChange={(e) => setSortState({ ...sortState, order: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>

                <button
                  onClick={handleApplySort}
                  className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Group Button */}
          <div className="relative" ref={groupMenuRef}>
            <button
              onClick={() => setShowGroupPanel(!showGroupPanel)}
              className={`px-4 py-2 rounded-lg font-medium text-white ${
                appliedGroupBy
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              Group By {appliedGroupBy && '✓'}
            </button>

            {showGroupPanel && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-48 p-4 space-y-2">
                <button
                  onClick={() => handleApplyGroupBy('')}
                  className={`w-full text-left px-3 py-2 rounded ${
                    !appliedGroupBy ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  None
                </button>
                <button
                  onClick={() => handleApplyGroupBy('status')}
                  className={`w-full text-left px-3 py-2 rounded ${
                    appliedGroupBy === 'status' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  Status
                </button>
                <button
                  onClick={() => handleApplyGroupBy('vehicle')}
                  className={`w-full text-left px-3 py-2 rounded ${
                    appliedGroupBy === 'vehicle' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  Vehicle
                </button>
                <button
                  onClick={() => handleApplyGroupBy('driver')}
                  className={`w-full text-left px-3 py-2 rounded ${
                    appliedGroupBy === 'driver' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  Driver
                </button>
              </div>
            )}
          </div>

          {/* Add Expense Button */}
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
          >
            + Add Expense
          </button>
        </div>
      </div>

      {/* Create Expense Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4"
          onClick={handleCloseModal}
        >
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Expense Log</h2>

            <div className="space-y-4">
              {/* Trip Search with Autocomplete */}
              <div ref={tripInputRef} className="relative">
                <label htmlFor="tripSearch" className="block text-sm font-medium text-gray-700 mb-2">
                  Trip
                </label>
                <input
                  type="text"
                  name="tripSearch"
                  id="tripSearch"
                  value={expenseForm.tripSearch}
                  onChange={handleFormChange}
                  onFocus={() => {
                    if (expenseForm.tripSearch.trim() === '') {
                      // Show all trips when field is empty
                      setTripSuggestions(availableTrips);
                    }
                    setShowTripSuggestions(true);
                  }}
                  placeholder="Search trip..."
                  className="w-full border p-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="off"
                />
                {showTripSuggestions && tripSuggestions.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {tripSuggestions.map((trip) => (
                      <button
                        key={trip._id}
                        type="button"
                        onClick={() => selectTrip(trip)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-100 border-b last:border-b-0"
                      >
                        <div className="font-medium">{trip.startLocation} → {trip.endLocation}</div>
                        <div className="text-xs text-gray-600">
                          {trip.driver?.user?.name || 'N/A'} • {trip.vehicle?.name || 'N/A'}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fuel Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Cost ($)</label>
                <input
                  type="number"
                  name="fuelCost"
                  value={expenseForm.fuelCost}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Misc Expense */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Misc. Expense ($)</label>
                <input
                  type="number"
                  name="miscExpense"
                  value={expenseForm.miscExpense}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Distance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Distance (KM) - Optional</label>
                <input
                  type="number"
                  name="distance"
                  value={expenseForm.distance}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to auto-calculate from trip odometer</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setExpenseForm({ tripId: '', tripSearch: '', fuelCost: '', miscExpense: '', distance: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateExpense}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table/Logs Display */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="text-center py-8 text-gray-600">Loading expenses...</div>
        ) : isGroupedView && Object.keys(filteredGroupedExpenses).length === 0 ? (
          <div className="text-center py-8 text-gray-600">No expenses found.</div>
        ) : !isGroupedView && filteredExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No expenses found.</div>
        ) : (
          <>
            {isGroupedView ? (
              // Grouped View
              <div className="divide-y">
                {Object.entries(filteredGroupedExpenses).map(([groupName, items]) => (
                  <div key={groupName} className="border-b">
                    <div className="bg-gray-50 px-4 py-3 font-semibold text-gray-700">
                      {groupName} ({items.length})
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody>
                          {items.map((expense, index) => (
                            <tr key={expense._id} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{expense.tripIdShort}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{expense.driverName}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{expense.distance} km</td>
                              <td className="px-4 py-3 text-sm text-gray-600">${expense.fuelCost?.toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">${expense.miscExpense?.toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">${expense.totalCost?.toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(expense.status)}`}>
                                  {expense.status?.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Regular View
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Row #</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Trip ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Driver</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Distance</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fuel Expense</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Misc. Expense</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Cost</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((expense, index) => (
                      <tr key={expense._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{expense.tripIdShort}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{expense.driverName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{expense.distance} km</td>
                        <td className="px-4 py-3 text-sm text-gray-600">${expense.fuelCost?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">${expense.miscExpense?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">${expense.totalCost?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(expense.status)}`}>
                            {expense.status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Expense;
