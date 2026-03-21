import Trip from "../../models/trip.schema.js";
import Driver from "../../models/driver.schema.js";
import response from "../../response/response.js";
import tripListQuerySchema from "../../validations/trip.list.validator.js";

const ALLOWED_STATUSES = ["draft", "dispatched", "completed", "cancelled"];

const parseSort = (sortParam) => {
  const [field, order] = (sortParam || "createdAt:desc").split(":");
  return { [field]: order === "asc" ? 1 : -1 };
};


const buildFilterObject = (query, companyId) => {
  const filter = { company: companyId };

  if (query.status) {
    const statuses = query.status
      .split(",")
      .map((status) => status.trim())
      .filter(Boolean);

    filter.status = { $in: statuses };
  }

  if (query.startDate || query.endDate) {
    filter.createdAt = {};

    if (query.startDate) {
      filter.createdAt.$gte = new Date(query.startDate);
    }

    if (query.endDate) {
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = endDate;
    }
  }

  if (query.minRevenue || query.maxRevenue) {
    filter.revenue = {};

    if (query.minRevenue) {
      filter.revenue.$gte = Number(query.minRevenue);
    }

    if (query.maxRevenue) {
      filter.revenue.$lte = Number(query.maxRevenue);
    }
  }

  if (query.minWeight || query.maxWeight) {
    filter.cargoWeight = {};

    if (query.minWeight) {
      filter.cargoWeight.$gte = Number(query.minWeight);
    }

    if (query.maxWeight) {
      filter.cargoWeight.$lte = Number(query.maxWeight);
    }
  }

  if (query.startLocation) {
    filter.startLocation = { $regex: query.startLocation, $options: "i" };
  }

  if (query.endLocation) {
    filter.endLocation = { $regex: query.endLocation, $options: "i" };
  }

  return filter;
};

const groupTrips = (trips, groupField) => {
  if (!groupField) {
    return trips;
  }

  return trips.reduce((acc, trip) => {
    let groupKey = "Unknown";

    if (groupField === "status") {
      groupKey = trip.status || "Unknown";
    }

    if (groupField === "driver") {
      groupKey = trip.driver?.user?.name || trip.driver?.user?.email || "Unknown Driver";
    }

    if (groupField === "vehicle") {
      groupKey = trip.vehicle?.licensePlate || trip.vehicle?.name || "Unknown Vehicle";
    }

    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }

    acc[groupKey].push(trip);
    return acc;
  }, {});
};

const getTripList = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    if (!companyId) {
      return response(res, 401, false, "Company ID is required");
    }

    const { error, value } = tripListQuerySchema.validate(req.query);

    if (error) {
      const errors = error.details.map((detail) => detail.message.replace(/"/g, ""));
      return response(res, 400, false, "Validation failed", errors);
    }

    if (value.startDate && value.endDate && new Date(value.startDate) > new Date(value.endDate)) {
      return response(res, 400, false, "startDate must be before or equal to endDate");
    }

    if (value.minRevenue && value.maxRevenue && Number(value.minRevenue) > Number(value.maxRevenue)) {
      return response(res, 400, false, "minRevenue must be less than or equal to maxRevenue");
    }

    if (value.minWeight && value.maxWeight && Number(value.minWeight) > Number(value.maxWeight)) {
      return response(res, 400, false, "minWeight must be less than or equal to maxWeight");
    }

    if (value.status) {
      const statuses = value.status
        .split(",")
        .map((status) => status.trim())
        .filter(Boolean);

      const invalidStatuses = statuses.filter((status) => !ALLOWED_STATUSES.includes(status));
      if (invalidStatuses.length > 0) {
        return response(res, 400, false, `Invalid status value(s): ${invalidStatuses.join(", ")}`);
      }
    }

    const page = value.page || 1;
    const limit = value.limit || 10;
    const skip = (page - 1) * limit;

    try {
      const filter = buildFilterObject(value, companyId);

      // If user is a driver, only show their assigned trips
      if (userRole === "driver") {
        const driverRecord = await Driver.findOne({ user: userId });
        if (driverRecord) {
          filter.driver = driverRecord._id;
        } else {
          // Driver has no record yet
          return response(res, 200, true, "Trip list fetched successfully", {
            trips: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
            },
          });
        }
      }

      const sortParam = value.sort || "createdAt:desc";
      const sort = parseSort(sortParam);

      const total = await Trip.countDocuments(filter);
      const trips = await Trip.find(filter)
        .populate("vehicle", "name licensePlate model vehicleType status")
        .populate({
          path: "driver",
          select: "licenseNumber licenseCategory licenseExpiry safetyScore status user",
          populate: {
            path: "user",
            select: "name email",
          },
        })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const payload = {
        trips: value.groupBy ? groupTrips(trips, value.groupBy) : trips,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      if (value.groupBy) {
        payload.groupedBy = value.groupBy;
      }

      return response(res, 200, true, "Trip list fetched successfully", payload);
    } catch (dbError) {
      console.error("Database error in getTripList:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error("getTripList error:", error.message || error);
    console.error("Full error:", error);
    return response(res, 500, false, "Error getting trip list");
  }
};

export default getTripList;