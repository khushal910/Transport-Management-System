import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNotification } from '../../hooks/useNotification';
import expenseBaseURL from '../../api/expenseBaseURL.ts';
import { useFormNavigation } from '../../hooks/useFormNavigation';
import { PageContainer, PageHeader } from '../../components/ui';
import PaginationContainer from '../../components/PaginationContainer';

const Expense = () => {
  const { notifyError, notifySuccess } = useNotification();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filteredGroupedExpenses, setFilteredGroupedExpenses] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGroupedView, setIsGroupedView] = useState(false);

  // Edit expense form state (for pending expenses only)
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    fuelCost: '',
    miscExpense: '',
    distance: '',
  });

  // UI state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 4,
    total: 0,
    totalPages: 1,
  });

  // Refs for closing dropdowns
  const filterMenuRef = useRef(null);
  const sortMenuRef = useRef(null);
  const groupMenuRef = useRef(null);

  const normalizeExpense = (expense) => ({
    ...expense,
    tripIdShort: expense.tripId?.slice(-3) || expense.tripId || 'N/A',
    vehicleLicensePlate: expense.vehicleLicensePlate || 'N/A',
    startLocation: expense.startLocation || 'N/A',
    endLocation: expense.endLocation || 'N/A',
  });

  // Enhanced search: full trip ID, vehicle name, license plate, driver, location, status
  const isExpenseMatchingSearch = (expense, query) => {
    if (!query.trim()) return true;
    const lowerQuery = query.toLowerCase();
    return (
      expense.tripId?.toLowerCase()?.includes(lowerQuery) || // Full trip ID
      expense.tripIdShort?.toLowerCase()?.includes(lowerQuery) || // Last 3 chars
      expense.driverName?.toLowerCase()?.includes(lowerQuery) ||
      expense.vehicleName?.toLowerCase()?.includes(lowerQuery) ||
      expense.vehicleLicensePlate?.toLowerCase()?.includes(lowerQuery) ||
      expense.startLocation?.toLowerCase()?.includes(lowerQuery) ||
      expense.endLocation?.toLowerCase()?.includes(lowerQuery) ||
      expense.status?.toLowerCase()?.includes(lowerQuery)
    );
  };

  // Fetch expenses
  const fetchExpenses = useCallback(async (pageToFetch = currentPage) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageToFetch,
        limit: pagination.limit,
        sort: `${appliedSort.field}:${appliedSort.order}`,
        ...(appliedGroupBy && { groupBy: appliedGroupBy }),
        ...appliedFilters,
      });

      const response = await expenseBaseURL.get(`/list?${queryParams}`);
      if (response.data.success) {
        let data = response.data.data.expenses;

        // Update pagination info
        if (response.data.data.pagination) {
          setPagination({
            page: response.data.data.pagination.page || pageToFetch,
            limit: response.data.data.pagination.limit || pagination.limit,
            total: response.data.data.pagination.total || 0,
            totalPages: response.data.data.pagination.totalPages || 1,
          });
        }

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
      notifyError('Failed to fetch expenses: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [appliedSort, appliedGroupBy, appliedFilters, searchQuery, pagination.limit, currentPage]);

  useEffect(() => {
    fetchExpenses(1);
  }, [appliedSort, appliedGroupBy, appliedFilters]);

  // Fetch expenses when currentPage changes
  useEffect(() => {
    fetchExpenses(currentPage);
  }, [currentPage, fetchExpenses]);

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
      setShowEditModal(false);
      setEditingExpenseId(null);
      setExpenseForm({ fuelCost: '', miscExpense: '', distance: '' });
    }
  };

  // Handle form input
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm((prev) => ({ ...prev, [name]: value }));
  };

  // Open edit modal for pending expense
  const handleEditExpense = (expense) => {
    if (expense.status !== 'pending') {
      notifyError(`Cannot edit ${expense.status} expenses`);
      return;
    }

    setEditingExpenseId(expense._id);
    setExpenseForm({
      fuelCost: expense.fuelCost || '',
      miscExpense: expense.miscExpense || '',
      distance: expense.distance || '',
    });
    setShowEditModal(true);
  };

  // Validate form
  const validateForm = () => {
    if (!expenseForm.fuelCost) {
      notifyError('Fuel Cost is required');
      return false;
    }

    if (Number(expenseForm.fuelCost) < 0) {
      notifyError('Fuel Cost cannot be negative');
      return false;
    }

    if (expenseForm.miscExpense && isNaN(expenseForm.miscExpense)) {
      notifyError('Misc Expense must be a valid number');
      return false;
    }

    if (expenseForm.distance && isNaN(expenseForm.distance)) {
      notifyError('Distance must be a valid number');
      return false;
    }

    return true;
  };

  // Update expense
  const handleUpdateExpense = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fuelCost: Number(expenseForm.fuelCost),
        miscExpense: Number(expenseForm.miscExpense) || 0,
        distance: expenseForm.distance ? Number(expenseForm.distance) : undefined,
      };

      const response = await expenseBaseURL.post(`/update/${editingExpenseId}`, payload);
      if (response.data.success) {
        notifySuccess(response.data.message || 'Expense updated and marked as completed');
        setShowEditModal(false);
        setEditingExpenseId(null);
        setExpenseForm({ fuelCost: '', miscExpense: '', distance: '' });
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      notifyError('Failed to update expense: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use the form navigation hook (3 input fields: fuelCost, miscExpense, distance)
  // Must be after handleUpdateExpense is defined
  const { inputRefs, handleKeyDown } = useFormNavigation(3, () => {
    if (showEditModal) {
      handleUpdateExpense({ preventDefault: () => {} });
    }
  }, showEditModal);

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
    <PageContainer>
      <PageHeader 
        title="Trip Expenses" 
        description="Expenses are automatically created when trips complete. Fill in fuel cost and distance to mark as completed."
      />

      <div className="space-y-6">
        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Search Bar */}
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by full/partial trip ID, vehicle name, license plate, driver, location, or status..."
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
            />
          </div>

          {/* Filter, Sort, Group Buttons */}
          <div className="flex gap-3 flex-wrap">
            {/* Filter Button */}
            <div className="relative" ref={filterMenuRef}>
              <button
                onClick={() => {
                  setShowFilterPanel(!showFilterPanel);
                  setShowSortPanel(false);
                  setShowGroupPanel(false);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  Object.values(filterState).some((v) => v !== '')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Filter
              </button>
              {showFilterPanel && (
                <div className="absolute top-full mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-4 space-y-4">
                  {/* Filter inputs */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={filterState.status}
                      onChange={(e) => setFilterState({ ...filterState, status: e.target.value })}
                      className="w-full border p-2 rounded mt-1"
                    >
                      <option value="">All</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <button
                    onClick={handleApplyFilters}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    Apply
                  </button>
                  <button
                    onClick={handleClearFilters}
                    className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Sort Button */}
            <div className="relative" ref={sortMenuRef}>
              <button
                onClick={() => {
                  setShowSortPanel(!showSortPanel);
                  setShowFilterPanel(false);
                  setShowGroupPanel(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Sort
              </button>
              {showSortPanel && (
                <div className="absolute top-full mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Sort By</label>
                    <select
                      value={sortState.field}
                      onChange={(e) => setSortState({ ...sortState, field: e.target.value })}
                      className="w-full border p-2 rounded mt-1"
                    >
                      <option value="date">Date</option>
                      <option value="fuelCost">Fuel Cost</option>
                      <option value="totalCost">Total Cost</option>
                      <option value="distance">Distance</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Order</label>
                    <select
                      value={sortState.order}
                      onChange={(e) => setSortState({ ...sortState, order: e.target.value })}
                      className="w-full border p-2 rounded mt-1"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                  <button
                    onClick={handleApplySort}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Group Button */}
            <div className="relative" ref={groupMenuRef}>
              <button
                onClick={() => {
                  setShowGroupPanel(!showGroupPanel);
                  setShowFilterPanel(false);
                  setShowSortPanel(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Group
              </button>
              {showGroupPanel && (
                <div className="absolute top-full mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-4 space-y-2">
                  <button
                    onClick={() => handleApplyGroupBy('status')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                  >
                    By Status
                  </button>
                  <button
                    onClick={() => handleApplyGroupBy('vehicle')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                  >
                    By Vehicle
                  </button>
                  <button
                    onClick={() => handleApplyGroupBy('driver')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                  >
                    By Driver
                  </button>
                  <button
                    onClick={() => {
                      setAppliedGroupBy('');
                      setShowGroupPanel(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-gray-600"
                  >
                    None
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Expense Modal */}
        {showEditModal && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4"
            onClick={handleCloseModal}
          >
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Fill Expense Data</h2>

              <div className="space-y-4">
                {/* Fuel Cost */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Cost ($) *</label>
                  <input
                    type="number"
                    name="fuelCost"
                    value={expenseForm.fuelCost}
                    onChange={handleFormChange}
                    onKeyDown={(e) => handleKeyDown(e, 0)}
                    ref={(el) => (inputRefs.current[0] = el)}
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
                    onKeyDown={(e) => handleKeyDown(e, 1)}
                    ref={(el) => (inputRefs.current[1] = el)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Distance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Distance (KM)</label>
                  <input
                    type="number"
                    name="distance"
                    value={expenseForm.distance}
                    onChange={handleFormChange}
                    onKeyDown={(e) => handleKeyDown(e, 2)}
                    ref={(el) => (inputRefs.current[2] = el)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to keep auto-calculated distance</p>
                </div>

                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  ℹ️ Filling in fuel cost and distance will mark this expense as completed.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingExpenseId(null);
                    setExpenseForm({ fuelCost: '', miscExpense: '', distance: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateExpense}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
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
                                <td className="px-4 py-3 text-sm text-gray-900">{(pagination.page - 1) * pagination.limit + index + 1}</td>
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
                                <td className="px-4 py-3 text-sm">
                                  {expense.status === 'pending' && (
                                    <button
                                      onClick={() => handleEditExpense(expense)}
                                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
                                    >
                                      Add Expense
                                    </button>
                                  )}
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
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((expense, index) => (
                        <tr key={expense._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{(pagination.page - 1) * pagination.limit + index + 1}</td>
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
                          <td className="px-4 py-3 text-sm">
                            {expense.status === 'pending' && (
                              <button
                                onClick={() => handleEditExpense(expense)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
                              >
                                Add Expense
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              {!showEditModal && (
              <PaginationContainer className="justify-between">
                <p className="text-sm text-gray-600">
                  Page {pagination.page} of {Math.max(pagination.totalPages, 1)} | Total expenses {pagination.total}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1 || isLoading}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="px-4 py-2 border border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages || isLoading}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="px-4 py-2 border border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    Next
                  </button>
                </div>
              </PaginationContainer>
              )}
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default Expense;

