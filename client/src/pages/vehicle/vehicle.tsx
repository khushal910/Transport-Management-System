import { useEffect, useRef, useState, ChangeEvent, FormEvent } from "react";
import { useNotification } from '../../hooks/useNotification';
import vehicleBaseURL from "../../api/vehicleBaseURL";
import { useFormNavigation } from "../../hooks/useFormNavigation";
import { PageContainer, PageHeader } from '../../components/ui';
import PaginationContainer from '../../components/PaginationContainer';

interface Vehicle {
  _id: string;
  name: string;
  licensePlate: string;
  model: string;
  vehicleType: string;
  maxCapacity: number;
  odometer: number;
  status?: string;
  [key: string]: any;
}

interface VehicleFormData {
  name: string;
  licensePlate: string;
  model: string;
  vehicleType: string;
  maxCapacity: string;
  odometer: string;
}

const VehicleRegistry = () => {
  const { notifyError, notifySuccess } = useNotification();

  // Get user role to determine read-only mode for dispatcher
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isReadOnly = user?.role === 'dispatcher';

  // vehicle list from backend
  const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);
  const [deletedVehicleList, setDeletedVehicleList] = useState<Vehicle[]>([]);

  // tab state
  const [activeTab, setActiveTab] = useState("active");

  // search state
  const [searchTerm, setSearchTerm] = useState("");
  const [deletedSearchTerm, setDeletedSearchTerm] = useState("");

  // filter state
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // sort state
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // dropdown refs for outside click handling
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vehicleForm, setVehicleForm] = useState<VehicleFormData>({
    name: "",
    licensePlate: "",
    model: "",
    vehicleType: "truck",
    maxCapacity: "",
    odometer: "",
    // Status is managed through system lifecycle only (trips, maintenance, etc.)
    // Not included in manual edits
  });


  const handleCloseModal = (event: React.MouseEvent<HTMLDivElement>) => {

    // if clicked on overlay (not modal box)
    if (event.target === event.currentTarget) {
      setIsModalOpen(false);
    }
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVehicleForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleFilterStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };

  const handleSortFieldChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSortField(e.target.value);
  };

  const handleSortOrderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterType("");
    setShowFilterMenu(false);
  };

  const clearSort = () => {
    setSortField("");
    setSortOrder("asc");
    setShowSortMenu(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }

      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const processVehicleList = () => {
    let processed = [...vehicleList];

    // Apply filters
    if (filterStatus) {
      processed = processed.filter((v) => v.status === filterStatus);
    }
    if (filterType) {
      processed = processed.filter((v) => v.vehicleType === filterType);
    }

    // Apply sort
    if (sortField) {
      processed.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === "string") {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return processed;
  };

  const resetForm = () => {
    setVehicleForm({
      name: "",
      licensePlate: "",
      model: "",
      vehicleType: "truck",
      maxCapacity: "",
      odometer: "",
    });
  };

  const handleCreateOrUpdateVehicle = async (e: FormEvent) => {
    e.preventDefault();

    // Status is managed through system lifecycle only (trips, maintenance, etc.)
    const payload = {
      name: vehicleForm.name,
      licensePlate: vehicleForm.licensePlate,
      model: vehicleForm.model,
      vehicleType: vehicleForm.vehicleType,
      maxCapacity: Number(vehicleForm.maxCapacity),
      odometer: Number(vehicleForm.odometer),
      // Status intentionally excluded - managed through lifecycle events
    };

    try {
      const isUpdate = !!editingVehicleId;
      const response = isUpdate
        ? await vehicleBaseURL.post(`/update/${editingVehicleId}`, payload)
        : await vehicleBaseURL.post('/register', payload);

      if (!response.data.success) {
        notifyError(response.data?.message || (isUpdate ? 'Update failed' : 'Registration failed'));
        return;
      }

      notifySuccess(response.data?.message || (isUpdate ? 'Vehicle updated successfully' : 'Vehicle registered successfully'));
      setIsModalOpen(false);
      resetForm();
      setEditingVehicleId(null);
      const refreshed = await vehicleBaseURL.get(
        `/list?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`
      );
      if (refreshed.data.success) {
        setVehicleList(refreshed.data.data);
      }
    } catch (error: unknown) {
      const isUpdate = !!editingVehicleId;
      const axiosError = error as any;
      notifyError(axiosError?.response?.data?.message || (isUpdate ? 'Update failed' : 'Registration failed'));
    } finally {
    }
  };

  // Use the form navigation hook (5 input fields: name, licensePlate, model, maxCapacity, odometer - excluding vehicleType select)
  // Must be after handleCreateOrUpdateVehicle is defined
  const { inputRefs, handleKeyDown } = useFormNavigation(5, () => {
    handleCreateOrUpdateVehicle({ preventDefault: () => {} } as FormEvent);
  }, isModalOpen);

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle._id);
    setVehicleForm({
      name: vehicle.name,
      licensePlate: vehicle.licensePlate,
      model: vehicle.model,
      vehicleType: vehicle.vehicleType,
      maxCapacity: String(vehicle.maxCapacity),
      odometer: String(vehicle.odometer),
      // Status not included - managed through system lifecycle
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (vehicleId: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      const response = await vehicleBaseURL.delete(`/delete/${vehicleId}`);

      if (!response.data.success) {
        notifyError(response.data?.message || 'Delete failed');
        return;
      }

      notifySuccess(response.data?.message || 'Vehicle deleted successfully');
      // Find the deleted vehicle and add it to deleted list
      const deletedVehicle = vehicleList.find(vehicle => vehicle._id === vehicleId);
      if (deletedVehicle) {
        setDeletedVehicleList([deletedVehicle, ...deletedVehicleList]);
      }
      // Remove deleted vehicle from active list
      setVehicleList(vehicleList.filter(vehicle => vehicle._id !== vehicleId));
    } catch (error) {
      notifyError((error as any).response?.data?.message || 'Delete failed');
    }
  };

  const handleRecover = async (vehicleId: string) => {
    if (!window.confirm('Are you sure you want to recover this vehicle?')) {
      return;
    }

    try {
      const response = await vehicleBaseURL.post(`/recover/${vehicleId}`);

      if (!response.data.success) {
        notifyError(response.data?.message || 'Recovery failed');
        return;
      }

      notifySuccess(response.data?.message || 'Vehicle recovered successfully');
      
      // Refresh both lists
      const deletedRefresh = await vehicleBaseURL.get(
        `/deleted/list?page=1&limit=100&search=${encodeURIComponent(deletedSearchTerm)}`
      );
      if (deletedRefresh.data.success) {
        setDeletedVehicleList(deletedRefresh.data.data);
      }

      const activeRefresh = await vehicleBaseURL.get(
        `/list?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`
      );
      if (activeRefresh.data.success) {
        setVehicleList(activeRefresh.data.data);
      }
    } catch (error) {
      notifyError((error as any).response?.data?.message || 'Recovery failed');
    }
  };

  useEffect(() => {
    let isActive = true;

    const run = async () => {
      try {
        const response = await vehicleBaseURL.get(
          `/list?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`
        );

        if (!response.data.success) {
          notifyError("Failed to fetch vehicles");
          return;
        }

        if (isActive) {
          setVehicleList(response.data.data);
        }
      } catch (error) {
        console.error("Vehicle fetch error:", error);
        notifyError("Failed to fetch vehicles");
      }
    };

    run();

    return () => {
      isActive = false;
    };

  }, [currentPage, itemsPerPage, searchTerm]);

  // Fetch deleted vehicles (manager only)
  useEffect(() => {
    let isActive = true;

    const run = async () => {
      // Skip fetching deleted vehicles for dispatcher
      if (isReadOnly) {
        return;
      }

      try {
        const response = await vehicleBaseURL.get(
          `/deleted/list?page=1&limit=100&search=${encodeURIComponent(deletedSearchTerm)}`
        );

        if (!response.data.success) {
          notifyError("Failed to fetch deleted vehicles");
          return;
        }

        if (isActive) {
          setDeletedVehicleList(response.data.data);
        }
      } catch (error) {
        console.error("Deleted vehicle fetch error:", error);
        notifyError("Failed to fetch deleted vehicles");
      }
    };

    run();

    return () => {
      isActive = false;
    };

  }, [deletedSearchTerm]);


  const renderVehicleRows = () => {
    const processed = processVehicleList();

    return processed.map((vehicle, index) => (

      <tr
        key={vehicle._id}
        className=" hover:bg-gray-50 transition"
      >

        {/* Row Number */}
        <td className="px-4 py-2 text-sm text-gray-700">
          {(currentPage - 1) * itemsPerPage + index + 1}
        </td>

        <td className="px-4 py-2">{vehicle.name}</td>
        <td className="px-4 py-2">{vehicle.licensePlate}</td>
        <td className="px-4 py-2">{vehicle.model}</td>
        <td className="px-4 py-2">{vehicle.vehicleType}</td>
        <td className="px-4 py-2">{vehicle.maxCapacity}</td>
        <td className="px-4 py-2">{vehicle.odometer}</td>
        <td className="px-4 py-2 capitalize">{vehicle.status}</td>

        {/* Action Buttons */}
        <td className="px-4 py-2 space-x-2" style={{ display: isReadOnly ? 'none' : 'table-cell' }}>

          <button
            onClick={() => handleEdit(vehicle)}
            disabled={vehicle.status !== 'available' && vehicle.status !== 'retired'}
            className={`px-3 py-1 text-sm rounded cursor-pointer transition-colors ${
              vehicle.status === 'available' || vehicle.status === 'retired'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
            title={vehicle.status !== 'available' && vehicle.status !== 'retired' ? 'Can only edit Available or Retired vehicles' : 'Edit this vehicle'}
          >
            Edit
          </button>

          <button
            onClick={() => handleDelete(vehicle._id)}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
          >
            Delete
          </button>

        </td>

      </tr>
    ));
  };

  const renderDeletedVehicleRows = () => {
    return deletedVehicleList.map((vehicle, index) => (
      <tr
        key={vehicle._id}
        className="hover:bg-gray-50 transition"
      >
        <td className="px-4 py-2 text-sm text-gray-700">{index + 1}</td>
        <td className="px-4 py-2">{vehicle.name}</td>
        <td className="px-4 py-2">{vehicle.licensePlate}</td>
        <td className="px-4 py-2">{vehicle.model}</td>
        <td className="px-4 py-2">{vehicle.vehicleType}</td>
        <td className="px-4 py-2">{vehicle.maxCapacity}</td>
        <td className="px-4 py-2">{vehicle.odometer}</td>
        <td className="px-4 py-2 capitalize">{vehicle.status}</td>

        {/* Recovery Button */}
        <td className="px-4 py-2">
          <button
            onClick={() => handleRecover(vehicle._id)}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
          >
            Recover
          </button>
        </td>
      </tr>
    ));
  };


  return (
    <PageContainer>
      <div className="flex flex-col h-[calc(100vh-80px)]">
        <PageHeader 
          title={isReadOnly ? "Vehicle Registry - Read Only" : "Vehicle Registry"} 
          description={isReadOnly ? "View available vehicles for trip assignment" : "Manage your fleet vehicles and track their status"}
        />

        <div className="flex-1 overflow-hidden flex flex-col space-y-4 pb-4">
      {/* TABS */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-3 font-semibold transition-colors ${
            activeTab === "active"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Active Vehicles
        </button>
        {!isReadOnly && (
        <button
          onClick={() => setActiveTab("deleted")}
          className={`px-4 py-3 font-semibold transition-colors relative ${
            activeTab === "deleted"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Deleted Vehicles
          {deletedVehicleList.length > 0 && (
            <span className="absolute top-2 right-0 bg-red-600 text-white text-xs rounded-full px-2 py-1">
              {deletedVehicleList.length}
            </span>
          )}
        </button>
        )}
      </div>

      {/* ACTIVE VEHICLES TAB */}
      {activeTab === "active" && (
        <>
      {/* -----------------------------
           SEARCH / ACTION BAR
      ------------------------------*/}

      <div className="flex flex-wrap gap-4 items-center justify-between mb-8">

        <input
          type="text"
          placeholder="Search vehicle..."
          className="w-full md:w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={handleSearchChange}
        />

        <div className="flex gap-3">

          <div className="relative" ref={filterMenuRef}>
            <button
              onClick={() => {
                setShowFilterMenu(!showFilterMenu);
                setShowSortMenu(false);
              }}
              className={`px-4 py-2 text-white rounded hover:opacity-90 cursor-pointer ${
                filterStatus || filterType ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              Filter
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-300 rounded shadow-lg z-20 p-3 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={filterType}
                    onChange={handleFilterTypeChange}
                    className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                    <option value="bike">Bike</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={handleFilterStatusChange}
                    className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="available">Available</option>
                    <option value="on_trip">On Trip</option>
                    <option value="in_shop">In Shop</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>

                <button
                  onClick={clearFilters}
                  className="w-full text-xs text-red-600 hover:text-red-800 font-semibold mt-2"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          <div className="relative" ref={sortMenuRef}>
            <button
              onClick={() => {
                setShowSortMenu(!showSortMenu);
                setShowFilterMenu(false);
              }}
              className={`px-4 py-2 text-white rounded hover:opacity-90 cursor-pointer ${
                sortField ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              Sort
            </button>

            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-300 rounded shadow-lg z-20 p-3 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortField}
                    onChange={handleSortFieldChange}
                    className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                  >
                    <option value="">None</option>
                    <option value="name">Name</option>
                    <option value="model">Model</option>
                    <option value="maxCapacity">Max Capacity</option>
                    <option value="odometer">Odometer</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={handleSortOrderChange}
                    className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>

                <button
                  onClick={clearSort}
                  className="w-full text-xs text-red-600 hover:text-red-800 font-semibold mt-2"
                >
                  Clear Sort
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer "
            style={{ display: isReadOnly ? 'none' : 'block' }}
          >
            New Vehicle
          </button>

        </div>

      </div>


      {/* -----------------------------
        {/* VEHICLE TABLE
        ------------------------------*/}

        <div className="overflow-x-auto flex-1">

          <table className="min-w-full ">

          <thead className="bg-gray-200 text-gray-700">

            <tr>

              <th className="px-4 py-2 text-left">No</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">License Plate</th>
              <th className="px-4 py-2 text-left">Model</th>
              <th className="px-4 py-2 text-left">Vehicle Type</th>
              <th className="px-4 py-2 text-left">Capacity</th>
              <th className="px-4 py-2 text-left">Odometer</th>
              <th className="px-4 py-2 text-left">Status</th>
              {!isReadOnly && <th className="px-4 py-2 text-left">Actions</th>}

            </tr>

          </thead>

          <tbody>{renderVehicleRows()}</tbody>

        </table>

      </div>


      {/* -----------------------------
           PAGINATION
      ------------------------------*/}

      {/* PAGINATION */}
      <PaginationContainer>
        <button
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage((prev) => Math.max(prev - 1, 1))
          }
          className="px-4 py-2 bg-gray-700 text-white rounded disabled:bg-gray-400 cursor-pointer hover:bg-gray-800 transition"
        >
          Previous
        </button>

        <button
          onClick={() =>
            setCurrentPage((prev) =>
              vehicleList.length < itemsPerPage ? prev : prev + 1
            )
          }
          className="px-4 py-2 bg-gray-700 text-white rounded cursor-pointer hover:bg-gray-800 transition"
        >
          Next
        </button>

      </PaginationContainer>
      </>
      )}

      {/* DELETED VEHICLES TAB */}
      {activeTab === "deleted" && (
        <>
      {/* Deleted Vehicles Search Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
        <input
          type="text"
          placeholder="Search deleted vehicles..."
          className="w-full md:w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          value={deletedSearchTerm}
          onChange={(e) => setDeletedSearchTerm(e.target.value)}
        />
      </div>

      {/* Deleted Vehicles Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">No</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">License Plate</th>
              <th className="px-4 py-2 text-left">Model</th>
              <th className="px-4 py-2 text-left">Vehicle Type</th>
              <th className="px-4 py-2 text-left">Capacity</th>
              <th className="px-4 py-2 text-left">Odometer</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deletedVehicleList.length > 0 ? (
              renderDeletedVehicleRows()
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-4 text-center text-gray-500">
                  No deleted vehicles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
        </>
      )}


      {/* -----------------------------
           ADD VEHICLE MODAL
      ------------------------------*/}

      {isModalOpen && (

        <div
          onClick={handleCloseModal}
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >

          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">

            <h2 className="text-xl font-semibold mb-4">
              {editingVehicleId ? 'Update Vehicle' : 'Register New Vehicle'}
            </h2>

            <form className="space-y-4" onSubmit={handleCreateOrUpdateVehicle}>

              <input
                type="text"
                placeholder="Vehicle Name"
                autoComplete="off"
                className="w-full border px-3 py-2 rounded"
                name="name"
                value={vehicleForm.name}
                onChange={handleFormChange}
                onKeyDown={(e) => handleKeyDown(e, 0)}
                ref={(el) => { if (el) (inputRefs.current as (HTMLInputElement | null)[])[0] = el; }}
                required
              />

              <input
                type="text"
                placeholder="License Plate"
                autoComplete="off"
                className="w-full border px-3 py-2 rounded"
                name="licensePlate"
                value={vehicleForm.licensePlate}
                onChange={handleFormChange}
                onKeyDown={(e) => handleKeyDown(e, 1)}
                ref={(el) => { if (el) (inputRefs.current as (HTMLInputElement | null)[])[1] = el; }}
                required
              />

              <input
                type="text"
                placeholder="Model"
                autoComplete="off"
                className="w-full border px-3 py-2 rounded"
                name="model"
                value={vehicleForm.model}
                onChange={handleFormChange}
                onKeyDown={(e) => handleKeyDown(e, 2)}
                ref={(el) => { if (el) (inputRefs.current as (HTMLInputElement | null)[])[2] = el; }}
                required
              />

              <select
                className="w-full border px-3 py-2 rounded"
                name="vehicleType"
                value={vehicleForm.vehicleType}
                onChange={handleFormChange}
              >
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="bike">Bike</option>
              </select>

              <input
                type="number"
                placeholder="Max Capacity"
                autoComplete="off"
                className="w-full border px-3 py-2 rounded"
                name="maxCapacity"
                value={vehicleForm.maxCapacity}
                onChange={handleFormChange}
                onKeyDown={(e) => handleKeyDown(e, 3)}
                ref={(el) => { if (el) (inputRefs.current as (HTMLInputElement | null)[])[3] = el; }}
                min="1"
                required
              />

              <input
                type="number"
                placeholder="Odometer"
                autoComplete="off"
                className="w-full border px-3 py-2 rounded"
                name="odometer"
                value={vehicleForm.odometer}
                onChange={handleFormChange}
                onKeyDown={(e) => handleKeyDown(e, 4)}
                ref={(el) => { if (el) (inputRefs.current as (HTMLInputElement | null)[])[4] = el; }}
                min="0"
                required
              />

              {/* Status is managed through system lifecycle events only:
                  - available: default when vehicle is created
                  - on_trip: automatically set when trip is created
                  - in_shop: managed through maintenance system
                  - retired: contact administrator to retire vehicles
                  Status cannot be manually changed here */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Status Management:</span>
                  <br />
                  Vehicle status is automatically managed by the system through:
                  <br />
                  • Trip creation/completion
                  <br />
                  • Maintenance workflows
                  <br />
                  • System lifecycle events
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {editingVehicleId ? 'Update Vehicle' : 'Register Vehicle'}
              </button>

            </form>

          </div>

        </div>

      )}

      </div>
      </div>
    </PageContainer>
  );
};

export default VehicleRegistry;