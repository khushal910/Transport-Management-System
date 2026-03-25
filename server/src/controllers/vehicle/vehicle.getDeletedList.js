import Vehicle from "../../models/vehicle.schema.js";
import response from "../../response/response.js";
import { DEFAULT_LIMIT, MAX_LIMIT } from '../../config/paginationConfig.js';

const getDeletedVehicleList = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { page = 1, limit = DEFAULT_LIMIT, search = "" } = req.query;

    if (!companyId) {
      return response(res, 403, false, "User is not associated with a company");
    }

    // Validate and limit the limit parameter
    const validLimit = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10)));

    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * validLimit;

    // Build query for deleted vehicles only
    let query = { company: companyId, isDeleted: true };

    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { licensePlate: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
      ];
    }

    // Fetch deleted vehicles with pagination
    const deletedVehicles = await Vehicle.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Return the list
    return response(res, 200, true, "Deleted vehicles retrieved successfully", deletedVehicles);
  } catch (error) {
    console.error("Error fetching deleted vehicles:", error);
    return response(res, 500, false, "Internal server error");
  }
};

export default getDeletedVehicleList;
