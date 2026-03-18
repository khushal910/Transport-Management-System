import MaintenanceLog from "../../models/maintenance.schema.js";
import response from "../../response/response.js";
import maintenanceListSchema from "../../validations/maintenance.list.validator.js";

const ALLOWED_STATUSES = ["pending", "completed", "cancelled"];

const parseSort = (sortParam) => {
  const [field, order] = (sortParam || "serviceDate:desc").split(":");
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
    filter.serviceDate = {};

    if (query.startDate) {
      filter.serviceDate.$gte = new Date(query.startDate);
    }

    if (query.endDate) {
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      filter.serviceDate.$lte = endDate;
    }
  }

  if (query.minCost || query.maxCost) {
    filter.cost = {};

    if (query.minCost) {
      filter.cost.$gte = Number(query.minCost);
    }

    if (query.maxCost) {
      filter.cost.$lte = Number(query.maxCost);
    }
  }

  if (query.description) {
    filter.description = { $regex: query.description, $options: "i" };
  }

  return filter;
};

const groupByStatus = (logs) => {
  return logs.reduce((acc, log) => {
    const status = log.status || "pending";
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(log);
    return acc;
  }, {});
};

const groupByVehicle = (logs) => {
  return logs.reduce((acc, log) => {
    const vehicleName = log.vehicle?.name || "Unknown Vehicle";
    if (!acc[vehicleName]) {
      acc[vehicleName] = [];
    }
    acc[vehicleName].push(log);
    return acc;
  }, {});
};

const getMaintenanceList = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return response(res, 401, false, "Company ID is required");
    }

    const { error, value } = maintenanceListSchema.validate(req.query);

    if (error) {
      const errors = error.details.map((detail) => detail.message.replace(/"/g, ""));
      return response(res, 400, false, "Validation failed", errors);
    }

    if (value.startDate && value.endDate && new Date(value.startDate) > new Date(value.endDate)) {
      return response(res, 400, false, "startDate must be before or equal to endDate");
    }

    if (value.minCost && value.maxCost && Number(value.minCost) > Number(value.maxCost)) {
      return response(res, 400, false, "minCost must be less than or equal to maxCost");
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
      const sortParam = value.sort || "serviceDate:desc";
      const sort = parseSort(sortParam);

      const total = await MaintenanceLog.countDocuments(filter);
      const logs = await MaintenanceLog.find(filter)
        .populate("vehicle", "name licensePlate model vehicleType status")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      let payload;

      if (value.groupBy === "status") {
        const groupedLogs = groupByStatus(logs);
        payload = {
          logs: groupedLogs,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          groupedBy: "status",
        };
      } else if (value.groupBy === "vehicle") {
        const groupedLogs = groupByVehicle(logs);
        payload = {
          logs: groupedLogs,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          groupedBy: "vehicle",
        };
      } else {
        payload = {
          logs,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      }

      return response(res, 200, true, "Maintenance list fetched successfully", payload);
    } catch (dbError) {
      console.error("Database error in getMaintenanceList:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error("getMaintenanceList error:", error.message || error);
    return response(res, 500, false, "Error getting maintenance list");
  }
};

export default getMaintenanceList;
