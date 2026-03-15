import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import tripBaseURL from "../../api/tripBaseURL";

const INITIAL_FORM = {
  vehiclePlateNumber: "",
  driverEmail: "",
  cargoWeight: "",
  startLocation: "",
  endLocation: "",
  revenue: "",
};

const Trip = () => {
  const [tripList, setTripList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [tripForm, setTripForm] = useState(INITIAL_FORM);

  useEffect(() => {
    let isMounted = true;

    const fetchTrips = async () => {
      setIsLoading(true);

      try {
        const response = await tripBaseURL.get("/list");

        if (!isMounted) {
          return;
        }

        if (response.data?.success && Array.isArray(response.data?.data)) {
          setTripList(response.data.data);
          return;
        }

        setTripList([]);
      } catch {
        // The backend currently exposes only create endpoint for trips.
        if (isMounted) {
          setTripList([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTrips();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTrips = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return tripList;
    }

    return tripList.filter((trip) => {
      const searchableText = [
        trip.vehiclePlateNumber,
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
    });
  }, [tripList, searchTerm]);

  const handleModalOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      setIsCreateModalOpen(false);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setTripForm((prev) => ({ ...prev, [name]: value }));
  };

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

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
        >
          Create Trip
        </button>
      </div>

      <div className="overflow-x-auto">
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
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-600">
                    <div className="inline-flex items-center gap-3">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                      Loading trips...
                    </div>
                  </td>
                </tr>
              ) : filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No trips found.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip, index) => (
                  <tr key={trip._id || `${trip.vehicle}-${index}`} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 text-sm text-gray-700">{index + 1}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {trip.vehiclePlateNumber || trip.vehicle || "N/A"}
                    </td>
                    <td className="px-4 py-2">{trip.driverEmail || trip.driver || "N/A"}</td>
                    <td className="px-4 py-2">
                      {trip.startLocation || "N/A"} to {trip.endLocation || "N/A"}
                    </td>
                    <td className="px-4 py-2">{trip.cargoWeight ?? "N/A"}</td>
                    <td className="px-4 py-2">{trip.revenue ?? "N/A"}</td>
                    <td className="px-4 py-2 capitalize">{trip.status || "draft"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
              <input
                name="vehiclePlateNumber"
                type="text"
                placeholder="Vehicle Plate Number"
                value={tripForm.vehiclePlateNumber}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded"
                required
              />

              <input
                name="driverEmail"
                type="email"
                placeholder="Driver Email"
                value={tripForm.driverEmail}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded"
                required
              />

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