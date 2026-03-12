import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import vehicleBaseURL from "../../api/vehicleBaseURL";

const VehicleRegistry = () => {


  // vehicle list from backend
  const [vehicleList, setVehicleList] = useState([]);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);


  const handleCloseModal = (event) => {

    // if clicked on overlay (not modal box)
    if (event.target === event.currentTarget) {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {

    const fetchVehicles = async () => {

      try {

        const response = await vehicleBaseURL.get(
          `/list?page=${currentPage}&limit=${itemsPerPage}`
        );

        if (!response.data.success) {
          toast.error("Failed to fetch vehicles");
          return;
        }

        setVehicleList(response.data.data);

      } catch (error) {

        console.error("Vehicle fetch error:", error);
        toast.error("Failed to fetch vehicles");

      }
    };

    fetchVehicles();

  }, [currentPage, itemsPerPage]);


  const renderVehicleRows = () => {

    return vehicleList.map((vehicle, index) => (

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

          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
            Edit
          </button>

          <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
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
        />

        <div className="flex gap-3">

          <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            Filter
          </button>

          <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            Sort
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
          className="px-4 py-2 bg-gray-700 text-white rounded disabled:bg-gray-400"
        >
          Previous
        </button>

        <button
          onClick={() =>
            setCurrentPage((prev) =>
              vehicleList.length < itemsPerPage ? prev : prev + 1
            )
          }
          className="px-4 py-2 bg-gray-700 text-white rounded"
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
              Register New Vehicle
            </h2>

            <form className="space-y-4">

              <input
                type="text"
                placeholder="Vehicle Name"
                className="w-full border px-3 py-2 rounded"
              />

              <input
                type="text"
                placeholder="License Plate"
                className="w-full border px-3 py-2 rounded"
              />

              <input
                type="text"
                placeholder="Model"
                className="w-full border px-3 py-2 rounded"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Register Vehicle
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default VehicleRegistry;