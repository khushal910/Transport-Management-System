import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import vehicleBaseURL from "../../api/vehicleBaseURL";

const API_URL = "http://localhost:3000/api/maintenance"; // Direct API URL

const INITIAL_FORM = {
  vehicleName: "",
  description: "",
  serviceDate: "",
  cost: "",
  distance: "",
};

const INITIAL_FILTERS = {
  status: "",
  startDate: "",
  endDate: "",
  minCost: "",
  maxCost: "",
  description: "",
};

const INITIAL_SORT = {
  field: "serviceDate",
  order: "desc",
};

const validateFilterState = (filters) => {
  if (filters.startDate && filters.endDate && new Date(filters.startDate) > new Date(filters.endDate)) {
    return "Start date must be before or equal to end date.";
  }

  if (filters.minCost && Number(filters.minCost) < 0) {
    return "Min cost cannot be negative.";
  }

  if (filters.maxCost && Number(filters.maxCost) < 0) {
    return "Max cost cannot be negative.";
  }

  if (
    filters.minCost &&
    filters.maxCost &&
    Number(filters.minCost) > Number(filters.maxCost)
  ) {
    return "Min cost must be less than or equal to max cost.";
  }

  return "";
};

const normalizeMaintenance = (log) => ({
  ...log,
  vehicleName: log.vehicle?.name || "N/A",
  plateNumber: log.vehicle?.licensePlate || "N/A",
  model: log.vehicle?.model || "N/A",
  logId: log._id || "N/A",
});

const isLogMatchingSearch = (log, query) => {
  const searchableText = [
    log.plateNumber,
    log.model,
    log.description,
    log.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query);
};

export default function MaintenancePage() {
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [groupedLogs, setGroupedLogs] = useState({});
  const [isGroupedView, setIsGroupedView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [filterState, setFilterState] = useState(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);
  const [sortState, setSortState] = useState(INITIAL_SORT);
  const [appliedSort, setAppliedSort] = useState(INITIAL_SORT);
  const [appliedGroupBy, setAppliedGroupBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [maintenanceForm, setMaintenanceForm] = useState(INITIAL_FORM);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleSuggestions, setVehicleSuggestions] = useState([]);
  const [showVehicleSuggestions, setShowVehicleSuggestions] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const filterMenuRef = useRef(null);
  const sortMenuRef = useRef(null);
  const groupMenuRef = useRef(null);
  const vehicleInputRef = useRef(null);

  const fetchMaintenanceLogs = useCallback(async (pageToFetch = currentPage) => {
    setIsLoading(true);

    try {
      const params = {
        page: pageToFetch,
        limit: 10,
        sort: `${appliedSort.field}:${appliedSort.order}`,
      };

      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value !== "") {
          params[key] = value;
        }
      });

      if (appliedGroupBy) {
        params.groupBy = appliedGroupBy;
      }

      const response = await fetch(`${API_URL}/list?${new URLSearchParams(params)}`, {
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        const logsData = data.data?.logs;

        if (Array.isArray(logsData)) {
          setMaintenanceList(logsData.map(normalizeMaintenance));
          setGroupedLogs({});
          setIsGroupedView(false);
        } else if (logsData && typeof logsData === "object") {
          const normalizedGrouped = Object.keys(logsData).reduce((acc, key) => {
            acc[key] = (logsData[key] || []).map(normalizeMaintenance);
            return acc;
          }, {});
          setGroupedLogs(normalizedGrouped);
          setMaintenanceList([]);
          setIsGroupedView(true);
        }

        setPagination({
          page: data.data?.pagination?.page || pageToFetch,
          limit: data.data?.pagination?.limit || 10,
          total: data.data?.pagination?.total || 0,
          totalPages: data.data?.pagination?.totalPages || 1,
        });
      } else {
        toast.error(data.message || "Failed to fetch maintenance logs");
      }
    } catch (error) {
      toast.error("Error fetching maintenance logs");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters, appliedGroupBy, appliedSort.field, appliedSort.order, currentPage]);

  // Fetch vehicles on mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await vehicleBaseURL.get("/list?page=1&limit=1000");
        if (res.data?.success && Array.isArray(res.data?.data)) {
          setVehicles(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
      }
    };

    fetchVehicles();
    fetchMaintenanceLogs(1);
  }, [fetchMaintenanceLogs]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterPanel(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortPanel(false);
      }
      if (groupMenuRef.current && !groupMenuRef.current.contains(event.target)) {
        setShowGroupPanel(false);
      }
      if (vehicleInputRef.current && !vehicleInputRef.current.contains(event.target)) {
        setShowVehicleSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const filteredLogs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return maintenanceList;
    }
    return maintenanceList.filter((log) => isLogMatchingSearch(log, query));
  }, [maintenanceList, searchTerm]);

  const filteredGroupedLogs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return groupedLogs;
    }
    return Object.keys(groupedLogs).reduce((acc, key) => {
      const searched = groupedLogs[key].filter((log) => isLogMatchingSearch(log, query));
      if (searched.length > 0) {
        acc[key] = searched;
      }
      return acc;
    }, {});
  }, [groupedLogs, searchTerm]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setMaintenanceForm((prev) => ({ ...prev, [name]: value }));

    // Handle vehicle search
    if (name === "vehicleName") {
      if (value.trim()) {
        const filtered = vehicles.filter((v) =>
          (v.name || "").toLowerCase().includes(value.toLowerCase())
        );
        setVehicleSuggestions(filtered);
        setShowVehicleSuggestions(true);
      } else {
        setVehicleSuggestions([]);
        setShowVehicleSuggestions(false);
      }
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const selectVehicle = (vehicleName) => {
    setMaintenanceForm((prev) => ({ ...prev, vehicleName }));
    setShowVehicleSuggestions(false);
    setVehicleSuggestions([]);
  };

  const validateForm = () => {
    const errors = {};

    if (!maintenanceForm.vehicleName.trim()) {
      errors.vehicleName = "Vehicle is required";
    }

    if (!maintenanceForm.description.trim()) {
      errors.description = "Issue/Service description is required";
    } else if (maintenanceForm.description.trim().length < 3) {
      errors.description = "Description must be at least 3 characters";
    }

    if (!maintenanceForm.serviceDate) {
      errors.serviceDate = "Service date is required";
    } else {
      const selectedDate = new Date(maintenanceForm.serviceDate);
      if (selectedDate <= new Date()) {
        errors.serviceDate = "Service date must be in the future";
      }
    }

    if (!maintenanceForm.cost) {
      errors.cost = "Cost is required";
    } else if (Number(maintenanceForm.cost) < 0) {
      errors.cost = "Cost cannot be negative";
    }

    if (maintenanceForm.distance && (isNaN(maintenanceForm.distance) || Number(maintenanceForm.distance) < 0)) {
      errors.distance = "Distance must be a valid positive number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateMaintenance = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        vehicleName: maintenanceForm.vehicleName.trim(),
        description: maintenanceForm.description.trim(),
        serviceDate: maintenanceForm.serviceDate,
        cost: Number(maintenanceForm.cost),
        distance: maintenanceForm.distance ? Number(maintenanceForm.distance) : undefined,
      };

      const response = await fetch(`${API_URL}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.message || "Failed to create maintenance service");
        return;
      }

      toast.success(data.message || "Maintenance service created successfully");
      setIsCreateModalOpen(false);
      setMaintenanceForm(INITIAL_FORM);
      setFormErrors({});
      fetchMaintenanceLogs(1);
    } catch (error) {
      toast.error("Error creating maintenance service");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyFilters = () => {
    const error = validateFilterState(filterState);
    if (error) {
      toast.error(error);
      return;
    }
    setAppliedFilters(filterState);
    setCurrentPage(1);
    setShowFilterPanel(false);
  };

  const handleApplySort = () => {
    setAppliedSort(sortState);
    setCurrentPage(1);
    setShowSortPanel(false);
  };

  const handleApplyGroupBy = (groupBy) => {
    setAppliedGroupBy(groupBy);
    setCurrentPage(1);
    setShowGroupPanel(false);
  };

  const handleClearFilters = () => {
    setFilterState(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    setCurrentPage(1);
    setShowFilterPanel(false);
  };

  const handleClearSort = () => {
    setSortState(INITIAL_SORT);
    setAppliedSort(INITIAL_SORT);
    setCurrentPage(1);
    setShowSortPanel(false);
  };

  const handleModalOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      setIsCreateModalOpen(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleUpdateStatus = async (maintenanceId, newStatus) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_URL}/status/${maintenanceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.message || "Failed to update maintenance status");
        return;
      }

      toast.success(data.message || "Maintenance status updated successfully");
      fetchMaintenanceLogs(currentPage);
    } catch (error) {
      toast.error("Error updating maintenance status");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canUpdateStatus = (status) => {
    return status !== "completed" && status !== "cancelled";
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Maintenance Management</h1>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by Log ID, Vehicle, Description, or Status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            + Create New Service
          </button>

          {/* Filter Button */}
          <div className="relative" ref={filterMenuRef}>
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`px-4 py-2 rounded-lg font-medium ${
                Object.values(appliedFilters).some((v) => v !== "")
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Filter {Object.values(appliedFilters).some((v) => v !== "") && "✓"}
            </button>

            {showFilterPanel && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-80 p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filterState.status}
                    onChange={(e) => setFilterState({ ...filterState, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={filterState.startDate}
                      onChange={(e) => setFilterState({ ...filterState, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={filterState.endDate}
                      onChange={(e) => setFilterState({ ...filterState, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Cost</label>
                    <input
                      type="number"
                      value={filterState.minCost}
                      onChange={(e) => setFilterState({ ...filterState, minCost: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Cost</label>
                    <input
                      type="number"
                      value={filterState.maxCost}
                      onChange={(e) => setFilterState({ ...filterState, maxCost: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleApplyFilters}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
                  >
                    Apply Filters
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
              className={`px-4 py-2 rounded-lg font-medium ${
                appliedSort.field !== "serviceDate"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Sort {appliedSort.field !== "serviceDate" && "✓"}
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
                    <option value="serviceDate">Service Date</option>
                    <option value="cost">Cost</option>
                    <option value="status">Status</option>
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

                <div className="flex gap-2">
                  <button
                    onClick={handleApplySort}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
                  >
                    Apply
                  </button>
                  <button
                    onClick={handleClearSort}
                    className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-400 text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Group By Button */}
          <div className="relative" ref={groupMenuRef}>
            <button
              onClick={() => setShowGroupPanel(!showGroupPanel)}
              className={`px-4 py-2 rounded-lg font-medium ${
                appliedGroupBy
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Group By {appliedGroupBy && "✓"}
            </button>

            {showGroupPanel && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-48 p-4 space-y-2">
                <button
                  onClick={() => handleApplyGroupBy("")}
                  className={`w-full text-left px-3 py-2 rounded ${
                    !appliedGroupBy ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                  }`}
                >
                  None
                </button>
                <button
                  onClick={() => handleApplyGroupBy("status")}
                  className={`w-full text-left px-3 py-2 rounded ${
                    appliedGroupBy === "status" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                  }`}
                >
                  Status
                </button>
                <button
                  onClick={() => handleApplyGroupBy("vehicle")}
                  className={`w-full text-left px-3 py-2 rounded ${
                    appliedGroupBy === "vehicle" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                  }`}
                >
                  Vehicle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table/Logs Display */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="text-center py-8 text-gray-600">Loading maintenance logs...</div>
        ) : isGroupedView && Object.keys(filteredGroupedLogs).length === 0 ? (
          <div className="text-center py-8 text-gray-600">No maintenance logs found.</div>
        ) : !isGroupedView && filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No maintenance logs found.</div>
        ) : (
          <>
            {isGroupedView ? (
              // Grouped View
              <div className="divide-y">
                {Object.entries(filteredGroupedLogs).map(([groupName, logs]) => (
                  <div key={groupName} className="border-b">
                    <div className="bg-gray-50 px-4 py-3 font-semibold text-gray-700">
                      {groupName} ({logs.length})
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody>
                          {logs.map((log, index) => (
                            <tr key={log._id} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{log.plateNumber}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{log.vehicleName}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{log.model}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{log.description}</td>
                              <td className="px-4 py-3 text-sm">
                                {new Date(log.serviceDate).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-sm">${log.cost || 0}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(log.status)}`}>
                                  {log.status?.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm flex gap-2">
                                {canUpdateStatus(log.status) && (
                                  <>
                                    {log.status === "pending" && (
                                      <>
                                        <button
                                          onClick={() => handleUpdateStatus(log._id, "completed")}
                                          disabled={isSubmitting}
                                          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
                                        >
                                          Complete
                                        </button>
                                        <button
                                          onClick={() => handleUpdateStatus(log._id, "cancelled")}
                                          disabled={isSubmitting}
                                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    )}
                                  </>
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
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Plate Number</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vehicle Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Model</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Issue/Service</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cost</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, index) => (
                      <tr key={log._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{log.plateNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{log.vehicleName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{log.model}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{log.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(log.serviceDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">${log.cost || 0}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(log.status)}`}>
                            {log.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm flex gap-2">
                          {canUpdateStatus(log.status) && (
                            <>
                              {log.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(log._id, "completed")}
                                    disabled={isSubmitting}
                                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
                                  >
                                    Complete
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(log._id, "cancelled")}
                                    disabled={isSubmitting}
                                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t">
                <div className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Maintenance Modal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50"
          onClick={handleModalOverlayClick}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">Create New Service</h2>

            <form onSubmit={handleCreateMaintenance} className="space-y-4">
              {/* Vehicle Name with Autocomplete */}
              <div ref={vehicleInputRef} className="relative">
                <label htmlFor="vehicleName" className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Name
                </label>
                <input
                  type="text"
                  name="vehicleName"
                  id="vehicleName"
                  value={maintenanceForm.vehicleName}
                  onChange={handleFormChange}
                  onFocus={() => setShowVehicleSuggestions(maintenanceForm.vehicleName.trim().length > 0)}
                  placeholder="Search vehicle..."
                  className={`w-full border p-2 rounded ${
                    formErrors.vehicleName ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  autoComplete="off"
                />
                {formErrors.vehicleName && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.vehicleName}</p>
                )}

                {showVehicleSuggestions && vehicleSuggestions.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {vehicleSuggestions.map((vehicle) => (
                      <button
                        key={vehicle._id}
                        type="button"
                        onClick={() => selectVehicle(vehicle.name)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-100 border-b last:border-b-0"
                      >
                        <div className="font-medium">{vehicle.name}</div>
                        <div className="text-xs text-gray-600">
                          {vehicle.licensePlate} • {vehicle.vehicleType}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Issue/Service
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={maintenanceForm.description}
                  onChange={handleFormChange}
                  placeholder="Describe the service or issue..."
                  rows="3"
                  className={`w-full border p-2 rounded ${
                    formErrors.description ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Service Date */}
              <div>
                <label htmlFor="serviceDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Service Date
                </label>
                <input
                  type="date"
                  name="serviceDate"
                  id="serviceDate"
                  value={maintenanceForm.serviceDate}
                  onChange={handleFormChange}
                  className={`w-full border p-2 rounded ${
                    formErrors.serviceDate ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
                {formErrors.serviceDate && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.serviceDate}</p>
                )}
              </div>

              {/* Cost */}
              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-2">
                  Cost ($)
                </label>
                <input
                  type="number"
                  name="cost"
                  id="cost"
                  value={maintenanceForm.cost}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full border p-2 rounded ${
                    formErrors.cost ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
                {formErrors.cost && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.cost}</p>
                )}
              </div>

              {/* Distance */}
              <div>
                <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-2">
                  Distance (KM) - Optional
                </label>
                <input
                  type="number"
                  name="distance"
                  id="distance"
                  value={maintenanceForm.distance}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full border p-2 rounded ${
                    formErrors.distance ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
                {formErrors.distance && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.distance}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Leave empty to auto-calculate from vehicle odometer</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 bg-gray-400 text-white p-2 rounded font-medium hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white p-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
