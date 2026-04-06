import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNotification } from '../../hooks/useNotification';
import tripBaseURL from "../../api/tripBaseURL";
import vehicleBaseURL from "../../api/vehicleBaseURL";
import authBaseURL from "../../api/authBaseURL";
import driverBaseURL from "../../api/driverBaseURL";
import { useFormNavigation } from "../../hooks/useFormNavigation";
import { PageContainer, PageHeader } from '../../components/ui';
import PaginationContainer from '../../components/PaginationContainer';
import LocationInput from '../../components/LocationInput';
import { LocationSuggestion } from '../../api/locationBaseURL';

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
  vehicleName: trip.vehicle?.name || "N/A",
  vehicleId: trip.vehicle?._id || "N/A",
  vehiclePlateNumber: trip.vehiclePlateNumber || trip.vehicle?.licensePlate || trip.vehicle?.name || "N/A",
  driverName: trip.driver?.user?.name || trip.driverName || "N/A",
  driverEmail: trip.driverEmail || trip.driver?.user?.email || "N/A",
  startLocation: trip.startLocation || "N/A",
  endLocation: trip.endLocation || "N/A",
  status: trip.status || "draft",
});

// Enhanced search: vehicle name, license plate, driver, location, trip ID, status
const isTripMatchingSearch = (trip, query) => {
  if (!query.trim()) return true;
  const lowerQuery = query.toLowerCase();
  return (
    trip.vehicleName?.toLowerCase()?.includes(lowerQuery) ||
    trip.vehiclePlateNumber?.toLowerCase()?.includes(lowerQuery) ||
    trip.driverName?.toLowerCase()?.includes(lowerQuery) ||
    trip.driverEmail?.toLowerCase()?.includes(lowerQuery) ||
    trip.startLocation?.toLowerCase()?.includes(lowerQuery) ||
    trip.endLocation?.toLowerCase()?.includes(lowerQuery) ||
    trip.status?.toLowerCase()?.includes(lowerQuery) ||
    trip._id?.toLowerCase()?.includes(lowerQuery)
  );
};

const Trip = () => {
  const { notifyError, notifySuccess } = useNotification();
  const [tripList, setTripList] = useState([]);
  const [groupedTrips, setGroupedTrips] = useState({});
  const [isGroupedView, setIsGroupedView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
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
  const [tripForm, setTripForm] = useState(INITIAL_FORM);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [detailTrip, setDetailTrip] = useState(null);
  const [tripRowNumber, setTripRowNumber] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicleSuggestions, setVehicleSuggestions] = useState([]);
  const [driverSuggestions, setDriverSuggestions] = useState([]);
  const [showVehicleSuggestions, setShowVehicleSuggestions] = useState(false);
  const [showDriverSuggestions, setShowDriverSuggestions] = useState(false);
  const [cargoWeightError, setCargoWeightError] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formMessageType, setFormMessageType] = useState("");
  const [selectedVehicleCapacity, setSelectedVehicleCapacity] = useState(null);
  
  // Location autocomplete states
  const [startLocationSuggestions, setStartLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [endLocationSuggestions, setEndLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showStartLocationSuggestions, setShowStartLocationSuggestions] = useState(false);
  const [showEndLocationSuggestions, setShowEndLocationSuggestions] = useState(false);
  const [isStartLocationLoading, setIsStartLocationLoading] = useState(false);
  const [isEndLocationLoading, setIsEndLocationLoading] = useState(false);
  
  const filterMenuRef = useRef(null);
  const sortMenuRef = useRef(null);
  const groupMenuRef = useRef(null);
  const vehicleInputRef = useRef(null);
  const driverInputRef = useRef(null);

  // Use the form navigation hook (6 input fields: vehiclePlateNumber, driverEmail, cargoWeight, startLocation, endLocation, revenue)
  const { inputRefs, handleKeyDown } = useFormNavigation(6, () => {
    if (isCreateModalOpen) {
      handleCreateTrip({ preventDefault: () => {} });
    } else if (isEditModalOpen) {
      handleUpdateTrip({ preventDefault: () => {} });
    }
  }, (isCreateModalOpen || isEditModalOpen));

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
      notifyError(error.response?.data?.message || "Unable to fetch trips");
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
        const res = await driverBaseURL.get("/list?page=1&limit=1000");
        console.log("Driver API response:", res.data);
        if (res.data?.success && res.data?.data?.drivers) {
          console.log("Drivers fetched:", res.data.data.drivers);
          setDrivers(res.data.data.drivers);
        } else {
          console.log("Driver API response data structure unexpected:", res.data);
        }
      } catch (error) {
        console.error("Failed to fetch drivers:", error);
        console.log("Trying fallback employee API...");
        // Fallback to employee list if driver API is unavailable
        try {
          const fallbackRes = await authBaseURL.get("/employees");
          console.log("Employee API response:", fallbackRes.data);
          if (fallbackRes.data?.success && fallbackRes.data?.data?.employees) {
            const availableDrivers = fallbackRes.data.data.employees.filter(
              (d) => d.role === "driver"
            );
            console.log("Drivers from fallback (employees):", availableDrivers);
            setDrivers(availableDrivers);
          }
        } catch (fallbackError) {
          console.error("Driver fallback fetch failed:", fallbackError);
        }
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

    // Handle vehicle plate search - show available if empty, filter if text entered
    if (name === "vehiclePlateNumber") {
      if (value.trim() === "") {
        // Show only available vehicles
        const availableVehicles = vehicles.filter((v) => v.status === "available");
        setVehicleSuggestions(availableVehicles);
        setShowVehicleSuggestions(true);
      } else {
        const filtered = vehicles.filter((v) =>
          v.status === "available" && (
            (v.licensePlate || "").toLowerCase().includes(value.toLowerCase()) ||
            (v.name || "").toLowerCase().includes(value.toLowerCase())
          )
        );
        setVehicleSuggestions(filtered);
        setShowVehicleSuggestions(true);
      }
    }

    // Handle driver email search - show available if empty, filter if text entered
    if (name === "driverEmail") {
      if (value.trim() === "") {
        // Show drivers with available or off_duty status
        console.log("All drivers in state:", drivers);
        const availableDriversList = drivers.filter((d) => d.status === "available" || d.status === "off_duty");
        console.log("Filtered available/off-duty drivers:", availableDriversList);
        setDriverSuggestions(availableDriversList);
        setShowDriverSuggestions(true);
      } else {
        const filtered = drivers.filter((d) =>
          (d.status === "available" || d.status === "off_duty") && (
            (d.email || "").toLowerCase().includes(value.toLowerCase()) ||
            (d.name || "").toLowerCase().includes(value.toLowerCase())
          )
        );
        console.log("Filtered drivers for search term:", value, filtered);
        setDriverSuggestions(filtered);
        setShowDriverSuggestions(true);
      }
    }

    // Handle cargo weight validation against vehicle capacity
    if (name === "cargoWeight") {
      if (value === "") {
        setCargoWeightError("");
      } else {
        const weight = Number(value);
        if (isNaN(weight)) {
          setCargoWeightError("Cargo weight must be a valid number");
        } else if (weight <= 0) {
          setCargoWeightError("Cargo weight must be greater than 0");
        } else if (selectedVehicleCapacity && weight > selectedVehicleCapacity) {
          setCargoWeightError(`Cargo weight exceeds vehicle capacity (${selectedVehicleCapacity} kg)`);
        } else if (weight > 10000) {
          setCargoWeightError("Cargo weight cannot exceed 10000 kg");
        } else {
          setCargoWeightError("");
        }
      }
    }
  };

  const selectVehicle = (vehicle) => {
    setTripForm((prev) => ({
      ...prev,
      vehiclePlateNumber: vehicle.licensePlate,
    }));
    setSelectedVehicleCapacity(vehicle.maxCapacity);
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

  // Location selection handlers
  const selectStartLocation = (location: LocationSuggestion) => {
    // Use display_name formatted to show city/area
    const locationName = location.display_name.split(',')[0]; // Get main location name
    setTripForm((prev) => ({
      ...prev,
      startLocation: locationName,
    }));
    setShowStartLocationSuggestions(false);
    setStartLocationSuggestions([]);
  };

  const selectEndLocation = (location: LocationSuggestion) => {
    const locationName = location.display_name.split(',')[0]; // Get main location name
    setTripForm((prev) => ({
      ...prev,
      endLocation: locationName,
    }));
    setShowEndLocationSuggestions(false);
    setEndLocationSuggestions([]);
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

  const hasActiveFilters = Object.values(appliedFilters).some((value) => value !== "");
  const hasActiveSort = appliedSort.field !== "createdAt" || appliedSort.order !== "desc";
  const hasActiveGroup = Boolean(appliedGroupBy);

  const handleCreateTrip = async (event) => {
    event.preventDefault();
    setFormMessage("");
    setFormMessageType("");

    const payload = {
      vehiclePlateNumber: tripForm.vehiclePlateNumber.trim(),
      driverEmail: tripForm.driverEmail.trim(),
      cargoWeight: Number(tripForm.cargoWeight),
      startLocation: tripForm.startLocation.trim(),
      endLocation: tripForm.endLocation.trim(),
      revenue: Number(tripForm.revenue),
    };

    // Validate cargo weight against vehicle capacity on submit
    if (cargoWeightError) {
      setFormMessage(cargoWeightError);
      setFormMessageType("error");
      notifyError(cargoWeightError);
      return;
    }

    if (!payload.cargoWeight || payload.cargoWeight <= 0) {
      const msg = "Cargo weight must be valid and greater than 0";
      setFormMessage(msg);
      setFormMessageType("error");
      notifyError(msg);
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await tripBaseURL.post("/create", payload);

      if (!response.data?.success) {
        const errorMsg = response.data?.message || "Unable to create trip";
        setFormMessage(errorMsg);
        setFormMessageType("error");
        notifyError(errorMsg);
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

      const successMsg = response.data?.message || "Trip created successfully";
      setFormMessage(successMsg);
      setFormMessageType("success");
      notifySuccess(successMsg);
      setTripForm(INITIAL_FORM);
      setSelectedVehicleCapacity(null);
      setCargoWeightError("");
      setShowVehicleSuggestions(false);
      setShowDriverSuggestions(false);
      setVehicleSuggestions([]);
      setDriverSuggestions([]);
      setIsCreateModalOpen(false);
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchTrips(1);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Unable to create trip";
      setFormMessage(errorMsg);
      setFormMessageType("error");
      notifyError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to cancel this trip?")) {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await tripBaseURL.patch(`/status/${tripId}`, { status: "cancelled" });

      if (!response.data?.success) {
        notifyError(response.data?.message || "Unable to cancel trip");
        return;
      }

      const updatedTrip = response.data?.data || {};

      setTripList((prev) =>
        prev.map((trip) =>
          trip._id === tripId
            ? {
                ...trip,
                ...updatedTrip,
                vehiclePlateNumber: trip.vehiclePlateNumber,
                driverEmail: trip.driverEmail,
              }
            : trip
        )
      );

      setGroupedTrips((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = updated[key].map((trip) =>
            trip._id === tripId
              ? {
                  ...trip,
                  ...updatedTrip,
                  vehiclePlateNumber: trip.vehiclePlateNumber,
                  driverEmail: trip.driverEmail,
                }
              : trip
          );
        });
        return updated;
      });

      notifySuccess(response.data?.message || "Trip cancelled successfully");
    } catch (error) {
      notifyError(error.response?.data?.message || "Unable to cancel trip");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditTrip = (trip) => {
    setSelectedTrip(trip);
    setTripForm({
      vehiclePlateNumber: trip.vehiclePlateNumber,
      driverEmail: trip.driverEmail,
      cargoWeight: trip.cargoWeight,
      startLocation: trip.startLocation,
      endLocation: trip.endLocation,
      revenue: trip.revenue,
    });
    setFormMessage("");
    setFormMessageType("");
    setCargoWeightError("");
    
    // Set vehicle capacity when editing
    const vehicle = vehicles.find(v => v.licensePlate === trip.vehiclePlateNumber);
    if (vehicle) {
      setSelectedVehicleCapacity(vehicle.maxCapacity);
    }
    
    setIsEditModalOpen(true);
  };

  const handleViewTripDetails = (trip, rowNumber) => {
    setDetailTrip(trip);
    setTripRowNumber(rowNumber);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = (event) => {
    if (event.target === event.currentTarget) {
      setIsDetailModalOpen(false);
      setDetailTrip(null);
      setTripRowNumber(null);
    }
  };

  const handleUpdateTrip = async (event) => {
    event.preventDefault();
    setFormMessage("");
    setFormMessageType("");

    if (!selectedTrip || !selectedTrip._id) {
      notifyError("Unable to identify trip for update");
      return;
    }

    // Validate cargo weight against vehicle capacity on submit
    if (cargoWeightError) {
      setFormMessage(cargoWeightError);
      setFormMessageType("error");
      notifyError(cargoWeightError);
      return;
    }

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

      const response = await tripBaseURL.put(`/update/${selectedTrip._id}`, payload);

      if (!response.data?.success) {
        const errorMsg = response.data?.message || "Unable to update trip";
        setFormMessage(errorMsg);
        setFormMessageType("error");
        notifyError(errorMsg);
        return;
      }

      const updatedTrip = response.data?.data || {};

      setTripList((prev) =>
        prev.map((trip) =>
          trip._id === selectedTrip._id
            ? {
                ...updatedTrip,
                vehiclePlateNumber: payload.vehiclePlateNumber,
                driverEmail: payload.driverEmail,
                startLocation: payload.startLocation,
                endLocation: payload.endLocation,
                cargoWeight: payload.cargoWeight,
                revenue: payload.revenue,
              }
            : trip
        )
      );

      setGroupedTrips((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = updated[key].map((trip) =>
            trip._id === selectedTrip._id
              ? {
                  ...updatedTrip,
                  vehiclePlateNumber: payload.vehiclePlateNumber,
                  driverEmail: payload.driverEmail,
                  startLocation: payload.startLocation,
                  endLocation: payload.endLocation,
                  cargoWeight: payload.cargoWeight,
                  revenue: payload.revenue,
                }
              : trip
          );
        });
        return updated;
      });

      const successMsg = response.data?.message || "Trip updated successfully";
      setFormMessage(successMsg);
      setFormMessageType("success");
      notifySuccess(successMsg);
      setTripForm(INITIAL_FORM);
      setSelectedVehicleCapacity(null);
      setCargoWeightError("");
      setShowVehicleSuggestions(false);
      setShowDriverSuggestions(false);
      setVehicleSuggestions([]);
      setDriverSuggestions([]);
      setSelectedTrip(null);
      setIsEditModalOpen(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Unable to update trip";
      setFormMessage(errorMsg);
      setFormMessageType("error");
      notifyError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canManageTrip = (tripStatus) => {
    return ["draft", "dispatched"].includes(tripStatus);
  };

  const handleUpdateStatus = async (tripId, newStatus) => {
    try {
      setIsSubmitting(true);

      const response = await tripBaseURL.patch(`/status/${tripId}`, { status: newStatus });

      if (!response.data?.success) {
        notifyError(response.data?.message || "Unable to update trip status");
        return;
      }

      const updatedTrip = response.data?.data || {};

      setTripList((prev) =>
        prev.map((trip) =>
          trip._id === tripId
            ? {
                ...trip,
                ...updatedTrip,
                vehiclePlateNumber: trip.vehiclePlateNumber,
                driverEmail: trip.driverEmail,
              }
            : trip
        )
      );

      setGroupedTrips((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = updated[key].map((trip) =>
            trip._id === tripId
              ? {
                  ...trip,
                  ...updatedTrip,
                  vehiclePlateNumber: trip.vehiclePlateNumber,
                  driverEmail: trip.driverEmail,
                }
              : trip
          );
        });
        return updated;
      });

      notifySuccess(response.data?.message || "Trip status updated successfully");
    } catch (error) {
      notifyError(error.response?.data?.message || "Unable to update trip status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Trip Dispatcher"
        description="Manage and monitor all fleet trips and deliveries"
      />

      <div className="space-y-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <input
            type="text"
            placeholder="Search by vehicle name, license plate, driver, location, or trip ID..."
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
                      <th className="px-4 py-2 text-left">License Plate</th>
                      <th className="px-4 py-2 text-left">Driver</th>
                      <th className="px-4 py-2 text-left">Route</th>
                      <th className="px-4 py-2 text-left">Cargo</th>
                      <th className="px-4 py-2 text-left">Revenue</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGroupedTrips[groupName].map((trip, index) => {
                      const rowNumber = (pagination.page - 1) * pagination.limit + index + 1;
                      return (
                      <tr key={trip._id || `${groupName}-${index}`} onClick={() => handleViewTripDetails(trip, rowNumber)} className="hover:bg-gray-100 transition cursor-pointer">
                        <td className="px-4 py-2 text-sm text-gray-700">{rowNumber}</td>
                        <td className="px-4 py-2 font-medium text-gray-900">{trip.vehiclePlateNumber}</td>
                        <td className="px-4 py-2">{trip.driverEmail}</td>
                        <td className="px-4 py-2">
                          {trip.startLocation} to {trip.endLocation}
                        </td>
                        <td className="px-4 py-2">{trip.cargoWeight ?? "N/A"}</td>
                        <td className="px-4 py-2">{trip.revenue ?? "N/A"}</td>
                        <td className="px-4 py-2 capitalize">{trip.status}</td>
                        <td className="px-4 py-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {canManageTrip(trip.status) && (
                            <button
                              onClick={() => handleDeleteTrip(trip._id)}
                              disabled={isDeleting}
                              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
                            >
                              Cancel
                            </button>
                          )}
                          {trip.status === "draft" && (
                            <button
                              onClick={() => handleUpdateStatus(trip._id, "dispatched")}
                              disabled={isSubmitting}
                              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
                            >
                              Dispatch
                            </button>
                          )}
                          {trip.status === "dispatched" && (
                            <button
                              onClick={() => handleUpdateStatus(trip._id, "completed")}
                              disabled={isSubmitting}
                              className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-purple-300"
                            >
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                      );
                    })}
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
                <th className="px-4 py-2 text-left">License Plate</th>
                <th className="px-4 py-2 text-left">Driver</th>
                <th className="px-4 py-2 text-left">Route</th>
                <th className="px-4 py-2 text-left">Cargo</th>
                <th className="px-4 py-2 text-left">Revenue</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No trips found.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip, index) => {
                  const rowNumber = (pagination.page - 1) * pagination.limit + index + 1;
                  return (
                  <tr key={trip._id || `${trip.vehiclePlateNumber}-${index}`} onClick={() => handleViewTripDetails(trip, rowNumber)} className="hover:bg-gray-100 transition cursor-pointer">
                    <td className="px-4 py-2 text-sm text-gray-700">{rowNumber}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">{trip.vehiclePlateNumber}</td>
                    <td className="px-4 py-2">{trip.driverEmail}</td>
                    <td className="px-4 py-2">
                      {trip.startLocation} to {trip.endLocation}
                    </td>
                    <td className="px-4 py-2">{trip.cargoWeight ?? "N/A"}</td>
                    <td className="px-4 py-2">{trip.revenue ?? "N/A"}</td>
                    <td className="px-4 py-2 capitalize">{trip.status}</td>
                    <td className="px-4 py-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {canManageTrip(trip.status) && (
                        <button
                          onClick={() => handleDeleteTrip(trip._id)}
                          disabled={isDeleting}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
                        >
                          Cancel
                        </button>
                      )}
                      {trip.status === "draft" && (
                        <button
                          onClick={() => handleUpdateStatus(trip._id, "dispatched")}
                          disabled={isSubmitting}
                          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
                        >
                          Dispatch
                        </button>
                      )}
                      {trip.status === "dispatched" && (
                        <button
                          onClick={() => handleUpdateStatus(trip._id, "completed")}
                          disabled={isSubmitting}
                          className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-purple-300"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                );
                })
              )}
            </tbody>
            </table>
        )}
      </div>

      {!(isCreateModalOpen || isEditModalOpen || isDetailModalOpen) && (
      <PaginationContainer>
        <p className="text-sm text-gray-600">
          Page {pagination.page} of {Math.max(pagination.totalPages, 1)} | Total trips {pagination.total}
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

      {isCreateModalOpen && (
        <div
          onClick={handleModalOverlayClick}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
            <h2 className="text-xl font-semibold mb-4">Create New Trip</h2>
            <p className="mt-1 text-sm text-gray-500 mb-4">
              Fill all fields to dispatch a new trip.
            </p>

            {formMessage && (
              <div className={`mb-4 p-3 rounded text-sm ${ formMessageType === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200' }`}>
                {formMessage}
              </div>
            )}

            <form onSubmit={handleCreateTrip} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="relative" ref={vehicleInputRef}>
                <input
                  name="vehiclePlateNumber"
                  type="text"
                  placeholder="Vehicle Plate Number"
                  autoComplete="off"
                  value={tripForm.vehiclePlateNumber}
                  onChange={handleFormChange}
                  onFocus={() => {
                    setShowVehicleSuggestions(true);
                    if (tripForm.vehiclePlateNumber.trim() === "") {
                      const availableVehicles = vehicles.filter((v) => v.status === "available");
                      setVehicleSuggestions(availableVehicles);
                    }
                  }}
                  onKeyDown={(e) => handleKeyDown(e, 0)}
                  ref={(el) => (inputRefs.current[0] = el)}
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
                  autoComplete="off"
                  value={tripForm.driverEmail}
                  onChange={handleFormChange}
                  onFocus={() => {
                    setShowDriverSuggestions(true);
                    if (tripForm.driverEmail.trim() === "") {
                      const availableDriversList = drivers.filter((d) => d.status === "available");
                      setDriverSuggestions(availableDriversList);
                    }
                  }}
                  onKeyDown={(e) => handleKeyDown(e, 1)}
                  ref={(el) => (inputRefs.current[1] = el)}
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

              <div>
                <input
                  name="cargoWeight"
                  type="number"
                  placeholder="Cargo Weight"
                  min="1"
                  autoComplete="off"
                  value={tripForm.cargoWeight}
                  onChange={handleFormChange}
                  onKeyDown={(e) => handleKeyDown(e, 2)}
                  ref={(el) => (inputRefs.current[2] = el)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
                {selectedVehicleCapacity && (
                  <p className="text-xs text-gray-600 mt-1">Vehicle capacity: {selectedVehicleCapacity} kg</p>
                )}
                {cargoWeightError && (
                  <p className="text-xs text-red-600 mt-1 font-medium">⚠️ {cargoWeightError}</p>
                )}
              </div>

              <div>
                <input
                  name="revenue"
                  type="number"
                  placeholder="Revenue"
                  min="0"
                  autoComplete="off"
                  value={tripForm.revenue}
                  onChange={handleFormChange}
                  onKeyDown={(e) => handleKeyDown(e, 3)}
                  ref={(el) => (inputRefs.current[3] = el)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>

              <LocationInput
                value={tripForm.startLocation}
                onChange={handleFormChange}
                onSelect={selectStartLocation}
                name="startLocation"
                placeholder="Search start location..."
                label="Start Location"
                showSuggestions={showStartLocationSuggestions}
                setShowSuggestions={setShowStartLocationSuggestions}
                suggestions={startLocationSuggestions}
                setSuggestions={setStartLocationSuggestions}
                isLoading={isStartLocationLoading}
                setIsLoading={setIsStartLocationLoading}
              />

              <LocationInput
                value={tripForm.endLocation}
                onChange={handleFormChange}
                onSelect={selectEndLocation}
                name="endLocation"
                placeholder="Search end location..."
                label="End Location"
                showSuggestions={showEndLocationSuggestions}
                setShowSuggestions={setShowEndLocationSuggestions}
                suggestions={endLocationSuggestions}
                setSuggestions={setEndLocationSuggestions}
                isLoading={isEndLocationLoading}
                setIsLoading={setIsEndLocationLoading}
              />

              <div className="col-span-1 mt-2 flex gap-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setCargoWeightError('');
                    setTripForm(INITIAL_FORM);
                    setSelectedVehicleCapacity(null);
                    setFormMessage('');
                    setFormMessageType('');
                  }}
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

      {isEditModalOpen && selectedTrip && (
        <div
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsEditModalOpen(false);
            }
          }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
            <h2 className="text-xl font-semibold mb-4">Update Trip</h2>
            <p className="mt-1 text-sm text-gray-500 mb-4">
              Update trip details. Only draft or dispatched trips can be modified.
            </p>

            <form onSubmit={handleUpdateTrip} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {formMessage && (
                <div className={`mb-4 p-3 rounded text-sm sm:col-span-2 ${
                  formMessageType === 'error' 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {formMessage}
                </div>
              )}

              <div className="relative" ref={vehicleInputRef}>
                <input
                  name="vehiclePlateNumber"
                  type="text"
                  placeholder="Vehicle Plate Number"
                  autoComplete="off"
                  value={tripForm.vehiclePlateNumber}
                  onChange={handleFormChange}
                  onFocus={() => {
                    setShowVehicleSuggestions(true);
                    if (tripForm.vehiclePlateNumber.trim() === "") {
                      const availableVehicles = vehicles.filter((v) => v.status === "available");
                      setVehicleSuggestions(availableVehicles);
                    }
                  }}
                  onKeyDown={(e) => handleKeyDown(e, 0)}
                  ref={(el) => (inputRefs.current[0] = el)}
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
                  autoComplete="off"
                  value={tripForm.driverEmail}
                  onChange={handleFormChange}
                  onFocus={() => {
                    setShowDriverSuggestions(true);
                    if (tripForm.driverEmail.trim() === "") {
                      const availableDriversList = drivers.filter((d) => d.status === "available");
                      setDriverSuggestions(availableDriversList);
                    }
                  }}
                  onKeyDown={(e) => handleKeyDown(e, 1)}
                  ref={(el) => (inputRefs.current[1] = el)}
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

              <div>
                <input
                  name="cargoWeight"
                  type="number"
                  placeholder="Cargo Weight"
                  min="1"
                  autoComplete="off"
                  value={tripForm.cargoWeight}
                  onChange={handleFormChange}
                  onKeyDown={(e) => handleKeyDown(e, 2)}
                  ref={(el) => (inputRefs.current[2] = el)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
                {selectedVehicleCapacity && (
                  <p className="text-xs text-gray-600 mt-1">Vehicle capacity: {selectedVehicleCapacity} kg</p>
                )}
                {cargoWeightError && (
                  <p className="text-xs text-red-600 mt-1 font-medium">⚠️ {cargoWeightError}</p>
                )}
              </div>

              <div>
                <input
                  name="revenue"
                  type="number"
                  placeholder="Revenue"
                  min="0"
                  autoComplete="off"
                  value={tripForm.revenue}
                  onChange={handleFormChange}
                  onKeyDown={(e) => handleKeyDown(e, 3)}
                  ref={(el) => (inputRefs.current[3] = el)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>

              <LocationInput
                value={tripForm.startLocation}
                onChange={handleFormChange}
                onSelect={selectStartLocation}
                name="startLocation"
                placeholder="Search start location..."
                label="Start Location"
                showSuggestions={showStartLocationSuggestions}
                setShowSuggestions={setShowStartLocationSuggestions}
                suggestions={startLocationSuggestions}
                setSuggestions={setStartLocationSuggestions}
                isLoading={isStartLocationLoading}
                setIsLoading={setIsStartLocationLoading}
              />

              <LocationInput
                value={tripForm.endLocation}
                onChange={handleFormChange}
                onSelect={selectEndLocation}
                name="endLocation"
                placeholder="Search end location..."
                label="End Location"
                showSuggestions={showEndLocationSuggestions}
                setShowSuggestions={setShowEndLocationSuggestions}
                suggestions={endLocationSuggestions}
                setSuggestions={setEndLocationSuggestions}
                isLoading={isEndLocationLoading}
                setIsLoading={setIsEndLocationLoading}
              />

              <div className="col-span-1 mt-2 flex gap-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedTrip(null);
                    setTripForm(INITIAL_FORM);
                    setCargoWeightError('');
                    setSelectedVehicleCapacity(null);
                    setFormMessage('');
                    setFormMessageType('');
                  }}
                  className="w-full border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Updating..." : "Update Trip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRIP DETAILS MODAL */}
      {isDetailModalOpen && detailTrip && (
        <div
          onClick={handleCloseDetailModal}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
        >
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 pt-6 pb-4 mb-6 border-b border-gray-200 flex items-center justify-between rounded-t-lg">
              <h2 className="text-2xl font-semibold">Trip Details</h2>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setDetailTrip(null);
                }}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full p-2 transition"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 pb-6">

            {/* Trip Information */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Trip Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Trip No.</p>
                  <p className="font-semibold text-gray-900">{tripRowNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`font-semibold capitalize px-2 py-1 rounded inline-block ${
                    detailTrip.status === "completed" ? "bg-green-100 text-green-800" :
                    detailTrip.status === "dispatched" ? "bg-blue-100 text-blue-800" :
                    detailTrip.status === "cancelled" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {detailTrip.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cargo Weight</p>
                  <p className="font-semibold text-gray-900">{detailTrip.cargoWeight ?? "N/A"} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="font-semibold text-gray-900">${detailTrip.revenue ?? "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Route</p>
                  <p className="font-semibold text-gray-900">
                    {detailTrip.startLocation} → {detailTrip.endLocation}
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Vehicle Information</h3>
              {detailTrip.vehicle ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">{detailTrip.vehicle.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">License Plate</p>
                    <p className="font-semibold text-gray-900">{detailTrip.vehicle.licensePlate || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Model</p>
                    <p className="font-semibold text-gray-900">{detailTrip.vehicle.model || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold text-gray-900 capitalize">{detailTrip.vehicle.vehicleType || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Max Capacity</p>
                    <p className="font-semibold text-gray-900">{detailTrip.vehicle.maxCapacity || "N/A"} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Odometer</p>
                    <p className="font-semibold text-gray-900">{detailTrip.vehicle.odometer || "N/A"} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Status</p>
                    <p className={`font-semibold capitalize px-2 py-1 rounded inline-block text-sm ${
                      detailTrip.vehicle.status === "available" ? "bg-green-100 text-green-800" :
                      detailTrip.vehicle.status === "on_trip" ? "bg-blue-100 text-blue-800" :
                      detailTrip.vehicle.status === "in_shop" ? "bg-orange-100 text-orange-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {detailTrip.vehicle.status || "N/A"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">Vehicle information not available</p>
              )}
            </div>

            {/* Driver Information */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Driver Information</h3>
              {detailTrip.driver && detailTrip.driver.user ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">{detailTrip.driver.user.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900 break-all">{detailTrip.driver.user.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">License Number</p>
                    <p className="font-semibold text-gray-900">{detailTrip.driver.licenseNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">License Category</p>
                    <p className="font-semibold text-gray-900 capitalize">{detailTrip.driver.licenseCategory || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">License Expiry</p>
                    <p className="font-semibold text-gray-900">{detailTrip.driver.licenseExpiry ? new Date(detailTrip.driver.licenseExpiry).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Safety Score</p>
                    <p className="font-semibold text-gray-900">{detailTrip.driver.safetyScore ?? "N/A"} / 100</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Driver Status</p>
                    <p className={`font-semibold capitalize px-2 py-1 rounded inline-block text-sm ${
                      detailTrip.driver.status === "on_duty" ? "bg-green-100 text-green-800" :
                      detailTrip.driver.status === "off_duty" ? "bg-gray-100 text-gray-800" :
                      detailTrip.driver.status === "on_trip" ? "bg-blue-100 text-blue-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {detailTrip.driver.status || "N/A"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">Driver information not available</p>
              )}
            </div>

            </div>
          </div>
        </div>
      )}
      </div>
    </PageContainer>
  );
};

export default Trip;