import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNotification } from '../../hooks/useNotification';
import { FaShieldAlt } from "react-icons/fa";
import driverBaseURL from "../../api/driverBaseURL";
import driverStatusBaseURL from "../../api/driverStatusBaseURL";
import DriverStatusModal from "../../components/DriverStatusModal";
import DriverStatusBadge from "../../components/DriverStatusBadge";
import { PageContainer, PageHeader } from '../../components/ui';
import vehicleBaseURL from "../../api/vehicleBaseURL";
import PaginationContainer from '../../components/PaginationContainer';

const INITIAL_FILTERS = {
  status: "",
  licenseCategory: "",
  minSafetyScore: "",
  maxSafetyScore: "",
  minCompletionRate: "",
  maxCompletionRate: "",
  minComplaints: "",
  maxComplaints: "",
  licenseExpiring: "",
};

const INITIAL_SORT = {
  field: "createdAt",
  order: "desc",
};

const validateFilterState = (filters) => {
  if (
    filters.minSafetyScore &&
    filters.maxSafetyScore &&
    Number(filters.minSafetyScore) > Number(filters.maxSafetyScore)
  ) {
    return "Min Safety Score must be less than or equal to Max Safety Score";
  }

  if (
    filters.minCompletionRate &&
    filters.maxCompletionRate &&
    Number(filters.minCompletionRate) > Number(filters.maxCompletionRate)
  ) {
    return "Min Completion Rate must be less than or equal to Max Completion Rate";
  }

  if (
    filters.minComplaints &&
    filters.maxComplaints &&
    Number(filters.minComplaints) > Number(filters.maxComplaints)
  ) {
    return "Min Complaints must be less than or equal to Max Complaints";
  }

  return "";
};

const normalizeDriver = (driver) => ({
  ...driver,
  name: driver.name || "N/A",
  licenseNumber: driver.licenseNumber || "N/A",
  licenseExpiry: driver.licenseExpiry ? new Date(driver.licenseExpiry) : null,
  safetyScore: driver.safetyScore || 0,
  completionRate: driver.completionRate || 0,
  complaints: driver.complaints || 0,
  status: driver.status || "off_duty",
});

const isDriverMatchingSearch = (driver, query) => {
  const searchableText = [
    driver.name,
    driver.email,
    driver.licenseNumber,
    driver.status,
    driver._id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query);
};

const getStatusBadgeColor = (status) => {
  switch (status) {
    case "on_duty":
      return "bg-green-100 text-green-800";
    case "off_duty":
      return "bg-gray-100 text-gray-800";
    case "on_trip":
      return "bg-blue-100 text-blue-800";
    case "suspended":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "on_duty":
      return "On Duty";
    case "off_duty":
      return "Off Duty";
    case "on_trip":
      return "On Trip";
    case "suspended":
      return "Suspended";
    default:
      return status;
  }
};

const getLicenseStatusBadgeColor = (expiryDate) => {
  if (!expiryDate) return "bg-gray-100 text-gray-800";

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (expiryDate < now) {
    return "bg-red-100 text-red-800";
  } else if (expiryDate <= thirtyDaysFromNow) {
    return "bg-yellow-100 text-yellow-800";
  }
  return "bg-green-100 text-green-800";
};

const getLicenseStatusLabel = (expiryDate) => {
  if (!expiryDate) return "Unknown";

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (expiryDate < now) {
    return "Expired";
  } else if (expiryDate <= thirtyDaysFromNow) {
    return "Expiring Soon";
  }
  return "Valid";
};

const Performance = () => {
  const { notifyError } = useNotification();
  const [driverList, setDriverList] = useState([]);
  const [groupedDrivers, setGroupedDrivers] = useState({});
  const [isGroupedView, setIsGroupedView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    limit: 4,
    total: 0,
    totalPages: 1,
  });

  // Driver status modal state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [selectedDriverName, setSelectedDriverName] = useState(null);
  const [driverInfo, setDriverInfo] = useState({});

  const filterMenuRef = useRef(null);
  const sortMenuRef = useRef(null);
  const groupMenuRef = useRef(null);

  const fetchDrivers = useCallback(
    async (pageToFetch = currentPage) => {
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

        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }

        const response = await driverBaseURL.get("/performance", { params });
        const payload = response.data?.data;
        const driversData = payload?.drivers;

        if (response.data?.success && Array.isArray(driversData)) {
          setDriverList(driversData.map(normalizeDriver));
          setGroupedDrivers({});
          setIsGroupedView(false);
        } else if (
          response.data?.success &&
          driversData &&
          typeof driversData === "object" &&
          !Array.isArray(driversData)
        ) {
          const normalizedGrouped = Object.keys(driversData).reduce((acc, key) => {
            acc[key] = (driversData[key] || []).map(normalizeDriver);
            return acc;
          }, {});

          setGroupedDrivers(normalizedGrouped);
          setDriverList([]);
          setIsGroupedView(true);
        } else {
          setDriverList([]);
          setGroupedDrivers({});
          setIsGroupedView(false);
        }

        setPagination({
          page: payload?.pagination?.page || pageToFetch,
          limit: payload?.pagination?.limit || 10,
          total: payload?.pagination?.total || 0,
          totalPages: payload?.pagination?.totalPages || 1,
        });
      } catch (error) {
        setDriverList([]);
        setGroupedDrivers({});
        setIsGroupedView(false);
        notifyError(
          error.response?.data?.message || "Unable to fetch drivers"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [appliedFilters, appliedGroupBy, appliedSort.field, appliedSort.order, currentPage, searchTerm]
  );

  useEffect(() => {
    fetchDrivers(currentPage);
  }, [currentPage, fetchDrivers]);

  // Fetch driver statuses
  const fetchDriverStatuses = async (drivers) => {
    try {
      const statuses = {};

      for (const driver of drivers) {
        try {
          // Fetch status for each driver
          const statusResponse = await driverStatusBaseURL.get(`?email=${driver.email}`);
          if (statusResponse.data.success) {
            statuses[driver._id] = statusResponse.data.data.status;
          }
        } catch (error) {
          // Status fetch error, will show as unknown
          console.error(`Failed to fetch status for driver ${driver._id}:`, error);
        }
      }
      setDriverInfo(statuses);
    } catch (error) {
      console.error('Error fetching driver statuses:', error);
    }
  };

  // Fetch statuses when driver list changes
  useEffect(() => {
    if (driverList.length > 0) {
      fetchDriverStatuses(driverList);
    } else if (Object.keys(groupedDrivers).length > 0) {
      const allDrivers = Object.values(groupedDrivers).flat();
      fetchDriverStatuses(allDrivers);
    }
  }, [driverList, groupedDrivers]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target)
      ) {
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

  const filteredDrivers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return driverList;
    }

    return driverList.filter((driver) => isDriverMatchingSearch(driver, query));
  }, [driverList, searchTerm]);

  const filteredGroupedDrivers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return groupedDrivers;
    }

    return Object.keys(groupedDrivers).reduce((acc, key) => {
      const searched = groupedDrivers[key].filter((driver) =>
        isDriverMatchingSearch(driver, query)
      );
      if (searched.length > 0) {
        acc[key] = searched;
      }
      return acc;
    }, {});
  }, [groupedDrivers, searchTerm]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilterState((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    const validationMessage = validateFilterState(filterState);
    if (validationMessage) {
      notifyError(validationMessage);
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

  const hasActiveFilters = Object.values(appliedFilters).some(
    (value) => value !== ""
  );
  const hasActiveSort =
    appliedSort.field !== "createdAt" || appliedSort.order !== "desc";
  const hasActiveGroup = Boolean(appliedGroupBy);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Header Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Driver Performance
        </h1>
        <p className="text-gray-600">
          Monitor driver performance, licenses, and safety metrics
        </p>
      </div>

      {/* Search and Controls Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
        <input
          type="text"
          placeholder="Search by name, email, or license..."
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <div className="flex gap-3">
          {/* Filter Button */}
          <div className="relative" ref={filterMenuRef}>
            <button
              type="button"
              onClick={() => {
                setShowFilterPanel((prev) => !prev);
                setShowSortPanel(false);
                setShowGroupPanel(false);
              }}
              className={`px-4 py-2 text-white rounded hover:opacity-90 cursor-pointer transition ${
                hasActiveFilters ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              Filter
            </button>

            {showFilterPanel && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded shadow-lg z-20 p-4 space-y-4 max-h-96 overflow-y-auto">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duty Status
                  </label>
                  <select
                    name="status"
                    value={filterState.status}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">All Status</option>
                    <option value="on_duty">On Duty</option>
                    <option value="off_duty">Off Duty</option>
                    <option value="on_trip">On Trip</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                {/* License Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    License Category
                  </label>
                  <select
                    name="licenseCategory"
                    value={filterState.licenseCategory}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">All Categories</option>
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                    <option value="bike">Bike</option>
                  </select>
                </div>

                {/* License Expiry Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    License Status
                  </label>
                  <select
                    name="licenseExpiring"
                    value={filterState.licenseExpiring}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">All</option>
                    <option value="expired">Expired</option>
                    <option value="expiring_30">Expiring Soon (30 days)</option>
                    <option value="valid">Valid</option>
                  </select>
                </div>

                {/* Safety Score Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Safety Score
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="minSafetyScore"
                      min="0"
                      max="100"
                      placeholder="Min"
                      value={filterState.minSafetyScore}
                      onChange={handleFilterChange}
                      className="w-1/2 border border-gray-300 px-2 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="number"
                      name="maxSafetyScore"
                      min="0"
                      max="100"
                      placeholder="Max"
                      value={filterState.maxSafetyScore}
                      onChange={handleFilterChange}
                      className="w-1/2 border border-gray-300 px-2 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Completion Rate Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Completion Rate (%)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="minCompletionRate"
                      min="0"
                      max="100"
                      placeholder="Min"
                      value={filterState.minCompletionRate}
                      onChange={handleFilterChange}
                      className="w-1/2 border border-gray-300 px-2 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="number"
                      name="maxCompletionRate"
                      min="0"
                      max="100"
                      placeholder="Max"
                      value={filterState.maxCompletionRate}
                      onChange={handleFilterChange}
                      className="w-1/2 border border-gray-300 px-2 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Complaints Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Complaints Count
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="minComplaints"
                      min="0"
                      placeholder="Min"
                      value={filterState.minComplaints}
                      onChange={handleFilterChange}
                      className="w-1/2 border border-gray-300 px-2 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="number"
                      name="maxComplaints"
                      min="0"
                      placeholder="Max"
                      value={filterState.maxComplaints}
                      onChange={handleFilterChange}
                      className="w-1/2 border border-gray-300 px-2 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={handleApplyFilters}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    Apply
                  </button>
                  <button
                    onClick={handleClearFilters}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 text-sm"
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
              type="button"
              onClick={() => {
                setShowSortPanel((prev) => !prev);
                setShowFilterPanel(false);
                setShowGroupPanel(false);
              }}
              className={`px-4 py-2 text-white rounded hover:opacity-90 cursor-pointer transition ${
                hasActiveSort ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              Sort
            </button>

            {showSortPanel && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-300 rounded shadow-lg z-20 p-4 space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortState.field}
                    onChange={(e) =>
                      setSortState((prev) => ({ ...prev, field: e.target.value }))
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="createdAt">Added Date</option>
                    <option value="name">Driver Name</option>
                    <option value="safetyScore">Safety Score</option>
                    <option value="completionRate">Completion Rate</option>
                    <option value="complaints">Complaints</option>
                    <option value="licenseExpiry">License Expiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Order
                  </label>
                  <select
                    value={sortState.order}
                    onChange={(e) =>
                      setSortState((prev) => ({ ...prev, order: e.target.value }))
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={handleApplySort}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    Apply
                  </button>
                  <button
                    onClick={handleClearSort}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 text-sm"
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
              type="button"
              onClick={() => {
                setShowGroupPanel((prev) => !prev);
                setShowFilterPanel(false);
                setShowSortPanel(false);
              }}
              className={`px-4 py-2 text-white rounded hover:opacity-90 cursor-pointer transition ${
                hasActiveGroup ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              Group By
            </button>

            {showGroupPanel && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-300 rounded shadow-lg z-20 p-4 space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Group By Field
                  </label>
                  <select
                    value={groupByState}
                    onChange={(e) => setGroupByState(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">None</option>
                    <option value="status">Duty Status</option>
                    <option value="licenseCategory">License Category</option>
                    <option value="licenseStatus">License Status</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={handleApplyGroup}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    Apply
                  </button>
                  <button
                    onClick={handleClearGroup}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500 flex items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            Loading drivers...
          </div>
        </div>
      )}

      {/* Drivers Table - Regular View */}
      {!isLoading && !isGroupedView && driverList.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  License
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Expiry
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Completion Rate
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Safety Score
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Complaints
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((driver) => (
                <tr
                  key={driver._id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 text-sm text-gray-900">{driver.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {driver.licenseNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getLicenseStatusBadgeColor(
                        driver.licenseExpiry
                      )}`}
                    >
                      {driver.licenseExpiry
                        ? driver.licenseExpiry.toLocaleDateString()
                        : "N/A"}
                      {" "} ({getLicenseStatusLabel(driver.licenseExpiry)})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            driver.completionRate >= 80
                              ? "bg-green-500"
                              : driver.completionRate >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${driver.completionRate}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-gray-900 font-medium min-w-12">
                        {driver.completionRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            driver.safetyScore >= 80
                              ? "bg-green-500"
                              : driver.safetyScore >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${driver.safetyScore}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-gray-900 font-medium min-w-12">
                        {driver.safetyScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900 font-semibold">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        driver.complaints === 0
                          ? "bg-green-100 text-green-800"
                          : driver.complaints <= 3
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {driver.complaints}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(
                        driver.status
                      )}`}
                    >
                      {getStatusLabel(driver.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <button
                      onClick={() => {
                        setSelectedDriverId(driver._id);
                        setSelectedDriverName(driver.name);
                        setIsStatusModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition duration-200"
                    >
                      <FaShieldAlt size={12} />
                      Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grouped View */}
      {!isLoading && isGroupedView && Object.keys(filteredGroupedDrivers).length > 0 && (
        <div className="space-y-8">
          {Object.entries(filteredGroupedDrivers).map(([groupKey, drivers]) => (
            <div key={groupKey}>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
                {groupKey} ({drivers.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-300">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        License
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Expiry
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Completion Rate
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Safety Score
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Complaints
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((driver) => (
                      <tr
                        key={driver._id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {driver.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {driver.licenseNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getLicenseStatusBadgeColor(
                              driver.licenseExpiry
                            )}`}
                          >
                            {driver.licenseExpiry
                              ? driver.licenseExpiry.toLocaleDateString()
                              : "N/A"}
                            {" "} ({getLicenseStatusLabel(driver.licenseExpiry)})
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  driver.completionRate >= 80
                                    ? "bg-green-500"
                                    : driver.completionRate >= 50
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: `${driver.completionRate}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-gray-900 font-medium min-w-12">
                              {driver.completionRate.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  driver.safetyScore >= 80
                                    ? "bg-green-500"
                                    : driver.safetyScore >= 60
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: `${driver.safetyScore}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-gray-900 font-medium min-w-12">
                              {driver.safetyScore}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 font-semibold">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              driver.complaints === 0
                                ? "bg-green-100 text-green-800"
                                : driver.complaints <= 3
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {driver.complaints}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(
                              driver.status
                            )}`}
                          >
                            {getStatusLabel(driver.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <button
                            onClick={() => {
                              setSelectedDriverId(driver._id);
                              setSelectedDriverName(driver.name);
                              setIsStatusModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition duration-200"
                          >
                            <FaShieldAlt size={12} />
                            Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading &&
        driverList.length === 0 &&
        Object.keys(groupedDrivers).length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No drivers found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && !isStatusModalOpen && (
        <PaginationContainer>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded transition ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            onClick={() =>
              setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))
            }
            disabled={currentPage === pagination.totalPages}
            className="px-4 py-2 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>

          <span className="text-gray-600 text-sm ml-4">
            Page {currentPage} of {pagination.totalPages}
          </span>
        </PaginationContainer>
      )}

      {/* Driver Status Modal */}
      {isStatusModalOpen && (
        <DriverStatusModal
          driverId={selectedDriverId}
          driverName={selectedDriverName}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedDriverId(null);
            setSelectedDriverName(null);
          }}
          onStatusUpdated={() => {
            fetchDrivers(currentPage);
          }}
        />
      )}
    </div>
  );
};

export default Performance;
