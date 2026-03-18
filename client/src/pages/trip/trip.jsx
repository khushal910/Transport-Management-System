import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import tripBaseURL from "../../api/tripBaseURL";
import vehicleBaseURL from "../../api/vehicleBaseURL";
import authBaseURL from "../../api/authBaseURL";

const INITIAL_FORM = {
  vehiclePlateNumber: "",
  driverEmail: "",
  cargoWeight: "",
  startLocation: "",
  endLocation: "",
  revenue: "",
};

const INITIAL_FILTERS = {
  status: "",
  startDate: "",
  endDate: "",
  minRevenue: "",
  maxRevenue: "",
  minWeight: "",
  maxWeight: "",
  startLocation: "",
  endLocation: "",
};

const INITIAL_SORT = {
  field: "createdAt",
  order: "desc",
};

const validateFilterState = (filters) => {
  if (filters.startDate && filters.endDate && new Date(filters.startDate) > new Date(filters.endDate)) {
    return "Start date must be before or equal to end date.";
  }

  if (filters.minRevenue && Number(filters.minRevenue) < 0) {
    return "Min revenue cannot be negative.";
  }

  if (filters.maxRevenue && Number(filters.maxRevenue) < 0) {
    return "Max revenue cannot be negative.";
  }

  if (filters.minWeight && Number(filters.minWeight) < 0) {
    return "Min cargo weight cannot be negative.";
  }

  if (filters.maxWeight && Number(filters.maxWeight) < 0) {
    return "Max cargo weight cannot be negative.";
  }

  if (
    filters.minRevenue &&
    filters.maxRevenue &&
    Number(filters.minRevenue) > Number(filters.maxRevenue)
  ) {
    return "Min revenue must be less than or equal to max revenue.";
  }

  if (filters.minWeight && filters.maxWeight && Number(filters.minWeight) > Number(filters.maxWeight)) {
    return "Min cargo weight must be less than or equal to max cargo weight.";
  }

  return "";
};

const normalizeTrip = (trip) => ({
  ...trip,
  vehiclePlateNumber: trip.vehiclePlateNumber || trip.vehicle?.licensePlate || trip.vehicle?.name || "N/A",
  driverName: trip.driver?.name || trip.driverName || "N/A",
  driverEmail: trip.driverEmail || trip.driver?.email || "N/A",
  startLocation: trip.startLocation || "N/A",
  endLocation: trip.endLocation || "N/A",
  status: trip.status || "draft",
});

const isTripMatchingSearch = (trip, query) => {
  const searchableText = [
    trip.vehiclePlateNumber,
    trip.driverName,
    trip.driverEmail,
    trip.startLocation,
    trip.endLocation,
    trip.status,
    trip._id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query);
};

const Trip = () => {
  const [tripList, setTripList] = useState([]);
  const [groupedTrips, setGroupedTrips] = useState({});
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
  const [groupByState, setGroupByState] = useState("");
  const [appliedGroupBy, setAppliedGroupBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [tripForm, setTripForm] = useState(INITIAL_FORM);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicleSuggestions, setVehicleSuggestions] = useState([]);
  const [driverSuggestions, setDriverSuggestions] = useState([]);
  const [showVehicleSuggestions, setShowVehicleSuggestions] = useState(false);
  const [showDriverSuggestions, setShowDriverSuggestions] = useState(false);
  const filterMenuRef = useRef(null);
  const sortMenuRef = useRef(null);
  const groupMenuRef = useRef(null);
  const vehicleInputRef = useRef(null);
  const driverInputRef = useRef(null);

  const fetchTrips = useCallback(async (pageToFetch = currentPage) => {
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

      const response = await tripBaseURL.get("/get", { params });
      const payload = response.data?.data;
      const tripsData = payload?.trips;

      if (response.data?.success && Array.isArray(tripsData)) {
        setTripList(tripsData.map(normalizeTrip));
        setGroupedTrips({});
        setIsGroupedView(false);
      } else if (
        response.data?.success &&
        tripsData &&
        typeof tripsData === "object" &&
        !Array.isArray(tripsData)
      ) {
        const normalizedGrouped = Object.keys(tripsData).reduce((acc, key) => {
          acc[key] = (tripsData[key] || []).map(normalizeTrip);
          return acc;
        }, {});

        setGroupedTrips(normalizedGrouped);
        setTripList([]);
        setIsGroupedView(true);
      } else {
        setTripList([]);
        setGroupedTrips({});
        setIsGroupedView(false);
      }

      setPagination({
        page: payload?.pagination?.page || pageToFetch,
        limit: payload?.pagination?.limit || 10,
        total: payload?.pagination?.total || 0,
        totalPages: payload?.pagination?.totalPages || 1,
      });
    } catch (error) {
      setTripList([]);
      setGroupedTrips({});
      setIsGroupedView(false);
      toast.error(error.response?.data?.message || "Unable to fetch trips");
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters, appliedGroupBy, appliedSort.field, appliedSort.order, currentPage]);

  // Fetch vehicles and drivers on component mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await vehicleBaseURL.get("/list?page=1&limit=1000");
        if (res.data?.success && Array.isArray(res.data?.data)) {
          // Filter only available vehicles
          const available = res.data.data.filter((v) => v.status === "available");
          setVehicles(available);
        }
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
      }
    };

    const fetchDrivers = async () => {
      try {
        const res = await authBaseURL.get("/employees");
        if (res.data?.success && res.data?.data?.employees) {
          // Filter only drivers with on_duty or off_duty status
          const availableDrivers = res.data.data.employees.filter(
            (d) => d.role === "driver"
          );
          setDrivers(availableDrivers);
        }
      } catch (error) {
        console.error("Failed to fetch drivers:", error);
      }
    };

    fetchVehicles();
    fetchDrivers();
  }, []);

  useEffect(() => {
    fetchTrips(currentPage);
  }, [currentPage, fetchTrips]);

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
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const filteredTrips = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return tripList;
    }

    return tripList.filter((trip) => isTripMatchingSearch(trip, query));
  }, [tripList, searchTerm]);

  const filteredGroupedTrips = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return groupedTrips;
    }

    return Object.keys(groupedTrips).reduce((acc, key) => {
      const searched = groupedTrips[key].filter((trip) => isTripMatchingSearch(trip, query));
      if (searched.length > 0) {
        acc[key] = searched;
      }
      return acc;
    }, {});
  }, [groupedTrips, searchTerm]);

  const handleModalOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      setIsCreateModalOpen(false);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setTripForm((prev) => ({ ...prev, [name]: value }));

    // Handle vehicle plate search
    if (name === "vehiclePlateNumber") {
      if (value.trim()) {
        const filtered = vehicles.filter((v) =>
          (v.licensePlate || "").toLowerCase().includes(value.toLowerCase()) ||
          (v.name || "").toLowerCase().includes(value.toLowerCase())
        );
        setVehicleSuggestions(filtered);
        setShowVehicleSuggestions(true);
      } else {
        setVehicleSuggestions([]);
        setShowVehicleSuggestions(false);
      }
    }

    // Handle driver email search
    if (name === "driverEmail") {
      if (value.trim()) {
        const filtered = drivers.filter((d) =>
          (d.email || "").toLowerCase().includes(value.toLowerCase())
        );
        setDriverSuggestions(filtered);
        setShowDriverSuggestions(true);
      } else {
        setDriverSuggestions([]);
        setShowDriverSuggestions(false);
      }
    }
  };

  const selectVehicle = (vehicle) => {
    setTripForm((prev) => ({
      ...prev,
      vehiclePlateNumber: vehicle.licensePlate,
    }));
    setShowVehicleSuggestions(false);
    setVehicleSuggestions([]);
  };

  const selectDriver = (driver) => {
    setTripForm((prev) => ({
      ...prev,
      driverEmail: driver.email,
    }));
    setShowDriverSuggestions(false);
    setDriverSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (vehicleInputRef.current && !vehicleInputRef.current.contains(event.target)) {
        setShowVehicleSuggestions(false);
      }
      if (driverInputRef.current && !driverInputRef.current.contains(event.target)) {
        setShowDriverSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilterState((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    const validationMessage = validateFilterState(filterState);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    setAppliedFilters(filterState);
    setCurrentPage(1);
    setShowFilterPanel(false);
  };

  const handleClearFilters = () => {
    setFilterState(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    setCurrentPage(1);
    setShowFilterPanel(false);
  };

  const handleApplySort = () => {
    setAppliedSort(sortState);
    setCurrentPage(1);
    setShowSortPanel(false);
  };

  const handleClearSort = () => {
    setSortState(INITIAL_SORT);
    setAppliedSort(INITIAL_SORT);
    setCurrentPage(1);
    setShowSortPanel(false);
  };

  const handleApplyGroup = () => {
    setAppliedGroupBy(groupByState);
    setCurrentPage(1);
    setShowGroupPanel(false);
  };

  const handleClearGroup = () => {
    setGroupByState("");
    setAppliedGroupBy("");
    setCurrentPage(1);
    setShowGroupPanel(false);
  };

  const hasActiveFilters = Object.values(appliedFilters).some((value) => value !== "");
  const hasActiveSort = appliedSort.field !== "createdAt" || appliedSort.order !== "desc";
  const hasActiveGroup = Boolean(appliedGroupBy);

  const handleCreateTrip = async (event) => {
    event.preventDefault();

    const payload = {
      vehiclePlateNumber: tripForm.vehiclePlateNumber.trim(),
      driverEmail: tripForm.driverEmail.trim(),
      cargoWeight: Number(tripForm.cargoWeight),
      startLocation: tripForm.startLocation.trim(),
      endLocation: tripForm.endLocation.trim(),
      revenue: Number(tripForm.revenue),
    };

    try {
      setIsSubmitting(true);

      const response = await tripBaseURL.post("/create", payload);

      if (!response.data?.success) {
        toast.error(response.data?.message || "Unable to create trip");
        return;
      }

      const createdTrip = response.data?.data || {};

      setTripList((prev) => [
        {
          ...createdTrip,
          vehiclePlateNumber: payload.vehiclePlateNumber,
          driverEmail: payload.driverEmail,
          startLocation: payload.startLocation,
          endLocation: payload.endLocation,
          cargoWeight: payload.cargoWeight,
          revenue: payload.revenue,
        },
        ...prev,
      ]);

      toast.success(response.data?.message || "Trip created successfully");
      setTripForm(INITIAL_FORM);
      setIsCreateModalOpen(false);
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchTrips(1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create trip");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">

      <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
        <input
          type="text"
          placeholder="Search trip..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-3">
          <div className="relative" ref={filterMenuRef}>
            <button
              type="button"
              onClick={() => {
                setShowFilterPanel((prev) => !prev);
                setShowSortPanel(false);
                setShowGroupPanel(false);
              }}
              className={`px-4 py-2 text-white rounded hover:opacity-90 cursor-pointer ${
                hasActiveFilters ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              Filter
            </button>

            {showFilterPanel && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-300 rounded shadow-lg z-20 p-3 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select
                    name="status"
                    value={filterState.status}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={filterState.startDate}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={filterState.endDate}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="minRevenue"
                    value={filterState.minRevenue}
                    onChange={handleFilterChange}
                    placeholder="Min Revenue"
                    min="0"
                    className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                  />
                  <input
                    type="number"
                    name="maxRevenue"
                    value={filterState.maxRevenue}
                    onChange={handleFilterChange}
                    placeholder="Max Revenue"
                    min="0"
                    className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="minWeight"
                    value={filterState.minWeight}
                    onChange={handleFilterChange}
                    placeholder="Min Weight"
                    min="0"
                    className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                  />
                  <input
                    type="number"
                    name="maxWeight"
                    value={filterState.maxWeight}
                    onChange={handleFilterChange}
                    placeholder="Max Weight"
                    min="0"
                    className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="startLocation"
                    value={filterState.startLocation}
                    onChange={handleFilterChange}
                    placeholder="Start Location"
                    className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                  />
                  <input
                    type="text"
                    name="endLocation"
                    value={filterState.endLocation}
                    onChange={handleFilterChange}
                    placeholder="End Location"
                    className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold"
                  >
                    Clear Filters
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyFilters}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={sortMenuRef}>
            <button
              type="button"
              onClick={() => {
                setShowSortPanel((prev) => !prev);
                setShowFilterPanel(false);
                setShowGroupPanel(false);
              }}
              className={`px-4 py-2 text-white rounded hover:opacity-90 cursor-pointer ${
                hasActiveSort ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              Sort By
            </button>

            {showSortPanel && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-300 rounded shadow-lg z-20 p-3 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Sort By</label>
                  <select
                    value={sortState.field}
                    onChange={(event) =>
                      setSortState((prev) => ({ ...prev, field: event.target.value }))
                    }
                    className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                  >
                    <option value="createdAt">Created Date</option>
                    <option value="revenue">Revenue</option>
                    <option value="cargoWeight">Cargo Weight</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Order</label>
                  <select
                    value={sortState.order}
                    onChange={(event) =>
                      setSortState((prev) => ({ ...prev, order: event.target.value }))
                    }
                    className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleClearSort}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold"
                  >
                    Clear Sort
                  </button>
                  <button
                    type="button"
                    onClick={handleApplySort}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={groupMenuRef}>
            <button
              type="button"
              onClick={() => {
                setShowGroupPanel((prev) => !prev);
                setShowFilterPanel(false);
                setShowSortPanel(false);
              }}
              className={`px-4 py-2 text-white rounded hover:opacity-90 cursor-pointer ${
                hasActiveGroup ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              Group By
            </button>

            {showGroupPanel && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-300 rounded shadow-lg z-20 p-3 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Group By</label>
                  <select
                    value={groupByState}
                    onChange={(event) => setGroupByState(event.target.value)}
                    className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                  >
                    <option value="">None</option>
                    <option value="status">Status</option>
                    <option value="driver">Driver</option>
                    <option value="vehicle">Vehicle</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleClearGroup}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold"
                  >
                    Clear Group
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyGroup}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
        >
          Create Trip
        </button>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Active: status {appliedFilters.status || "all"}, sort {appliedSort.field}:{appliedSort.order},
        group {appliedGroupBy || "none"}
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-gray-600">
            <div className="inline-flex items-center gap-3">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              Loading trips...
            </div>
          </div>
        ) : isGroupedView ? (
          Object.keys(filteredGroupedTrips).length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">No trips found.</div>
          ) : (
            Object.keys(filteredGroupedTrips).map((groupName) => (
              <div key={groupName} className="mb-6 border rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-gray-100 text-gray-800 font-semibold">
                  {groupName} ({filteredGroupedTrips[groupName].length})
                </div>
                <table className="min-w-full">
                  <thead className="bg-gray-200 text-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left">No</th>
                      <th className="px-4 py-2 text-left">Vehicle</th>
                      <th className="px-4 py-2 text-left">Driver</th>
                      <th className="px-4 py-2 text-left">Route</th>
                      <th className="px-4 py-2 text-left">Cargo</th>
                      <th className="px-4 py-2 text-left">Revenue</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGroupedTrips[groupName].map((trip, index) => (
                      <tr key={trip._id || `${groupName}-${index}`} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-2 text-sm text-gray-700">{index + 1}</td>
                        <td className="px-4 py-2 font-medium text-gray-900">{trip.vehiclePlateNumber}</td>
                        <td className="px-4 py-2">{trip.driverEmail}</td>
                        <td className="px-4 py-2">
                          {trip.startLocation} to {trip.endLocation}
                        </td>
                        <td className="px-4 py-2">{trip.cargoWeight ?? "N/A"}</td>
                        <td className="px-4 py-2">{trip.revenue ?? "N/A"}</td>
                        <td className="px-4 py-2 capitalize">{trip.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">No</th>
                <th className="px-4 py-2 text-left">Vehicle</th>
                <th className="px-4 py-2 text-left">Driver</th>
                <th className="px-4 py-2 text-left">Route</th>
                <th className="px-4 py-2 text-left">Cargo</th>
                <th className="px-4 py-2 text-left">Revenue</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No trips found.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip, index) => (
                  <tr key={trip._id || `${trip.vehiclePlateNumber}-${index}`} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 text-sm text-gray-700">{index + 1}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">{trip.vehiclePlateNumber}</td>
                    <td className="px-4 py-2">{trip.driverEmail}</td>
                    <td className="px-4 py-2">
                      {trip.startLocation} to {trip.endLocation}
                    </td>
                    <td className="px-4 py-2">{trip.cargoWeight ?? "N/A"}</td>
                    <td className="px-4 py-2">{trip.revenue ?? "N/A"}</td>
                    <td className="px-4 py-2 capitalize">{trip.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Page {pagination.page} of {Math.max(pagination.totalPages, 1)} | Total trips {pagination.total}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pagination.page <= 1 || isLoading}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages || isLoading}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {isCreateModalOpen && (
        <div
          onClick={handleModalOverlayClick}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
            <h2 className="text-xl font-semibold mb-4">Create New Trip</h2>
            <p className="mt-1 text-sm text-gray-500 mb-4">
              Fill all fields to dispatch a new trip.
            </p>

            <form onSubmit={handleCreateTrip} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="relative" ref={vehicleInputRef}>
                <input
                  name="vehiclePlateNumber"
                  type="text"
                  placeholder="Vehicle Plate Number"
                  value={tripForm.vehiclePlateNumber}
                  onChange={handleFormChange}
                  onFocus={() => tripForm.vehiclePlateNumber && setShowVehicleSuggestions(true)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
                {showVehicleSuggestions && vehicleSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-48 overflow-y-auto">
                    {vehicleSuggestions.map((vehicle) => (
                      <div
                        key={vehicle._id}
                        onClick={() => selectVehicle(vehicle)}
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                      >
                        <div className="font-semibold">{vehicle.licensePlate}</div>
                        <div className="text-xs text-gray-600">
                          {vehicle.name} ({vehicle.vehicleType})
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={driverInputRef}>
                <input
                  name="driverEmail"
                  type="email"
                  placeholder="Driver Email"
                  value={tripForm.driverEmail}
                  onChange={handleFormChange}
                  onFocus={() => tripForm.driverEmail && setShowDriverSuggestions(true)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
                {showDriverSuggestions && driverSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-48 overflow-y-auto">
                    {driverSuggestions.map((driver) => (
                      <div
                        key={driver._id}
                        onClick={() => selectDriver(driver)}
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                      >
                        <div className="font-semibold">{driver.email}</div>
                        <div className="text-xs text-gray-600">{driver.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input
                name="cargoWeight"
                type="number"
                placeholder="Cargo Weight"
                min="1"
                value={tripForm.cargoWeight}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded"
                required
              />

              <input
                name="revenue"
                type="number"
                placeholder="Revenue"
                min="0"
                value={tripForm.revenue}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded"
                required
              />

              <input
                name="startLocation"
                type="text"
                placeholder="Start Location"
                value={tripForm.startLocation}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded"
                required
              />

              <input
                name="endLocation"
                type="text"
                placeholder="End Location"
                value={tripForm.endLocation}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded"
                required
              />

              <div className="col-span-1 mt-2 flex gap-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-full border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create Trip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trip;