import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import vehicleBaseURL from "../../api/vehicleBaseURL";

const VehicleRegistry = () => {


  // vehicle list from backend
  const [vehicleList, setVehicleList] = useState([]);

  // search state
  const [searchTerm, setSearchTerm] = useState("");

  // filter state
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // sort state
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // dropdown refs for outside click handling
  const filterMenuRef = useRef(null);
  const sortMenuRef = useRef(null);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({
    name: "",
    licensePlate: "",
    model: "",
    vehicleType: "truck",
    maxCapacity: "",
    odometer: "",
    // Status is managed through system lifecycle only (trips, maintenance, etc.)
    // Not included in manual edits
  });


  const handleCloseModal = (event) => {

    // if clicked on overlay (not modal box)
    if (event.target === event.currentTarget) {
      setIsModalOpen(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setVehicleForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };

  const handleSortFieldChange = (e) => {
    setSortField(e.target.value);
  };

  const handleSortOrderChange = (e) => {
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
    const handleOutsideClick = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }

      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
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

  const handleCreateOrUpdateVehicle = async (e) => {
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
        toast.error(response.data?.message || (isUpdate ? 'Update failed' : 'Registration failed'));
        return;
      }

      toast.success(response.data?.message || (isUpdate ? 'Vehicle updated successfully' : 'Vehicle registered successfully'));
      setIsModalOpen(false);
      resetForm();
      setEditingVehicleId(null);
      const refreshed = await vehicleBaseURL.get(
        `/list?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`
      );
      if (refreshed.data.success) {
        setVehicleList(refreshed.data.data);
      }
    } catch (error) {
      const isUpdate = !!editingVehicleId;
      toast.error(error.response?.data?.message || (isUpdate ? 'Update failed' : 'Registration failed'));
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicleId(vehicle._id);
    setVehicleForm({
      name: vehicle.name,
      licensePlate: vehicle.licensePlate,
      model: vehicle.model,
      vehicleType: vehicle.vehicleType,
      maxCapacity: vehicle.maxCapacity,
      odometer: vehicle.odometer,
      // Status not included - managed through system lifecycle
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      const response = await vehicleBaseURL.delete(`/delete/${vehicleId}`);

      if (!response.data.success) {
        toast.error(response.data?.message || 'Delete failed');
        return;
      }

      toast.success(response.data?.message || 'Vehicle deleted successfully');
      const refreshed = await vehicleBaseURL.get(
        `/list?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`
      );
      if (refreshed.data.success) {
        setVehicleList(refreshed.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
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
          toast.error("Failed to fetch vehicles");
          return;
        }

        if (isActive) {
          setVehicleList(response.data.data);
        }
      } catch (error) {
        console.error("Vehicle fetch error:", error);
        toast.error("Failed to fetch vehicles");
      }
    };

    run();

    return () => {
      isActive = false;
    };

  }, [currentPage, itemsPerPage, searchTerm]);


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
        <td className="px-4 py-2 space-x-2">

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


  return (
    <div className="p-6 bg-white rounded-lg shadow">

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
          >
            New Vehicle
          </button>

        </div>

      </div>


      {/* -----------------------------
           VEHICLE TABLE
      ------------------------------*/}

      <div className="overflow-x-auto">

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
              <th className="px-4 py-2 text-left">Actions</th>

            </tr>

          </thead>

          <tbody>{renderVehicleRows()}</tbody>

        </table>

      </div>


      {/* -----------------------------
           PAGINATION
      ------------------------------*/}

      <div className="flex gap-4 mt-6">

        <button
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage((prev) => Math.max(prev - 1, 1))
          }
          className="px-4 py-2 bg-gray-700 text-white rounded disabled:bg-gray-400 cursor-pointer "
        >
          Previous
        </button>

        <button
          onClick={() =>
            setCurrentPage((prev) =>
              vehicleList.length < itemsPerPage ? prev : prev + 1
            )
          }
          className="px-4 py-2 bg-gray-700 text-white rounded cursor-pointer "
        >
          Next
        </button>

      </div>


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
                className="w-full border px-3 py-2 rounded"
                name="name"
                value={vehicleForm.name}
                onChange={handleFormChange}
                required
              />

              <input
                type="text"
                placeholder="License Plate"
                className="w-full border px-3 py-2 rounded"
                name="licensePlate"
                value={vehicleForm.licensePlate}
                onChange={handleFormChange}
                required
              />

              <input
                type="text"
                placeholder="Model"
                className="w-full border px-3 py-2 rounded"
                name="model"
                value={vehicleForm.model}
                onChange={handleFormChange}
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
                className="w-full border px-3 py-2 rounded"
                name="maxCapacity"
                value={vehicleForm.maxCapacity}
                onChange={handleFormChange}
                min="1"
                required
              />

              <input
                type="number"
                placeholder="Odometer"
                className="w-full border px-3 py-2 rounded"
                name="odometer"
                value={vehicleForm.odometer}
                onChange={handleFormChange}
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
  );
};

export default VehicleRegistry;