import mongoose from "mongoose";
import Driver from "../../models/driver.schema.js";
import response from "../../response/response.js";
import driverListQuerySchema from "../../validations/driver.list.validator.js";

const parseSort = (sortParam) => {
  const [field, order] = (sortParam || "createdAt:desc").split(":");
  const fieldMapping = {
    name: "userData.name",
    createdAt: "createdAt",
    safetyScore: "safetyScore",
    completionRate: "completionRate",
    complaints: "complaints",
    licenseExpiry: "licenseExpiry",
  };
  const mappedField = fieldMapping[field] || field;
  return { [mappedField]: order === "asc" ? 1 : -1 };
};

const buildFilterObject = (query) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.licenseCategory) {
    filter.licenseCategory = query.licenseCategory;
  }

  if (query.minSafetyScore || query.maxSafetyScore) {
    filter.safetyScore = {};
    if (query.minSafetyScore) {
      filter.safetyScore.$gte = Number(query.minSafetyScore);
    }
    if (query.maxSafetyScore) {
      filter.safetyScore.$lte = Number(query.maxSafetyScore);
    }
  }

  if (query.minCompletionRate || query.maxCompletionRate) {
    filter.completionRate = {};
    if (query.minCompletionRate) {
      filter.completionRate.$gte = Number(query.minCompletionRate);
    }
    if (query.maxCompletionRate) {
      filter.completionRate.$lte = Number(query.maxCompletionRate);
    }
  }

  if (query.minComplaints || query.maxComplaints) {
    filter.complaints = {};
    if (query.minComplaints) {
      filter.complaints.$gte = Number(query.minComplaints);
    }
    if (query.maxComplaints) {
      filter.complaints.$lte = Number(query.maxComplaints);
    }
  }

  // License expiry filters
  if (query.licenseExpiring) {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (query.licenseExpiring === "expired") {
      filter.licenseExpiry = { $lt: now };
    } else if (query.licenseExpiring === "expiring_30") {
      filter.licenseExpiry = { $gte: now, $lte: thirtyDaysFromNow };
    } else if (query.licenseExpiring === "valid") {
      filter.licenseExpiry = { $gt: thirtyDaysFromNow };
    }
    // 'all' means no filter applied
  }

  return filter;
};

const groupDrivers = (drivers, groupField) => {
  if (!groupField) {
    return drivers;
  }

  return drivers.reduce((acc, driver) => {
    let groupKey = "Unknown";

    if (groupField === "status") {
      const statusMap = {
        on_duty: "On Duty",
        off_duty: "Off Duty",
        on_trip: "On Trip",
        suspended: "Suspended",
      };
      groupKey = statusMap[driver.status] || driver.status;
    }

    if (groupField === "licenseCategory") {
      const categoryMap = {
        truck: "Truck License",
        van: "Van License",
        bike: "Bike License",
      };
      groupKey = categoryMap[driver.licenseCategory] || driver.licenseCategory;
    }

    if (groupField === "licenseStatus") {
      const now = new Date();
      if (driver.licenseExpiry < now) {
        groupKey = "Expired";
      } else if (driver.licenseExpiry <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) {
        groupKey = "Expiring Soon (30 days)";
      } else {
        groupKey = "Valid";
      }
    }

    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }

    acc[groupKey].push(driver);
    return acc;
  }, {});
};

const getDriverList = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return response(res, 401, false, "Company ID is required");
    }

    const { error, value } = driverListQuerySchema.validate(req.query);

    if (error) {
      const errors = error.details.map((detail) => detail.message.replace(/"/g, ""));
      return response(res, 400, false, "Validation failed", errors);
    }

    // Validate score ranges
    if (
      value.minSafetyScore &&
      value.maxSafetyScore &&
      Number(value.minSafetyScore) > Number(value.maxSafetyScore)
    ) {
      return response(
        res,
        400,
        false,
        "minSafetyScore must be less than or equal to maxSafetyScore"
      );
    }

    if (
      value.minCompletionRate &&
      value.maxCompletionRate &&
      Number(value.minCompletionRate) > Number(value.maxCompletionRate)
    ) {
      return response(
        res,
        400,
        false,
        "minCompletionRate must be less than or equal to maxCompletionRate"
      );
    }

    if (
      value.minComplaints &&
      value.maxComplaints &&
      Number(value.minComplaints) > Number(value.maxComplaints)
    ) {
      return response(
        res,
        400,
        false,
        "minComplaints must be less than or equal to maxComplaints"
      );
    }

    const page = value.page || 1;
    const limit = value.limit || 10;
    const skip = (page - 1) * limit;

    const filterObj = buildFilterObject(value);
    const sortParam = value.sort || "createdAt:desc";
    const sort = parseSort(sortParam);

    // Convert companyId to ObjectId for aggregation
    const companyObjectId = new mongoose.Types.ObjectId(companyId);

      // Build aggregation pipeline
      const pipeline = [
        // Join with User collection
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userData",
          },
        },
        // Unwind user data
        {
          $unwind: {
            path: "$userData",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Filter by company
        {
          $match: {
            "userData.company": companyObjectId,
          },
        },
        // Apply other filters
        {
          $match: filterObj,
        },
      ];

      // Add search filter if needed
      if (value.search) {
        pipeline.push({
          $match: {
            $or: [
              { "userData.name": { $regex: value.search, $options: "i" } },
              { licenseNumber: { $regex: value.search, $options: "i" } },
            ],
          },
        });
      }

      // Get total count before pagination
      const countPipeline = [...pipeline];
      const countResult = await Driver.aggregate([
        ...countPipeline,
        { $count: "total" },
      ]);
      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      // Apply sorting
      pipeline.push({ $sort: sort });

      // Apply pagination
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      // Execute aggregation
      const driversAggregated = await Driver.aggregate(pipeline);

      // Apply grouping if requested
      if (value.groupBy) {
        const drivers = driversAggregated.map((doc) => ({
          _id: doc._id,
          name: doc.userData?.name || "N/A",
          email: doc.userData?.email || "N/A",
          licenseNumber: doc.licenseNumber,
          licenseExpiry: doc.licenseExpiry,
          licenseCategory: doc.licenseCategory,
          safetyScore: doc.safetyScore,
          completionRate: doc.completionRate,
          complaints: doc.complaints,
          status: doc.status,
          createdAt: doc.createdAt,
        }));

        const grouped = groupDrivers(drivers, value.groupBy);

        return response(res, 200, true, "Drivers fetched successfully", {
          drivers: grouped,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
          isGrouped: true,
        });
      }

      // Format response
      const formattedDrivers = driversAggregated.map((doc) => ({
        _id: doc._id,
        name: doc.userData?.name || "N/A",
        email: doc.userData?.email || "N/A",
        licenseNumber: doc.licenseNumber,
        licenseExpiry: doc.licenseExpiry,
        licenseCategory: doc.licenseCategory,
        safetyScore: doc.safetyScore,
        completionRate: doc.completionRate,
        complaints: doc.complaints,
        status: doc.status,
        createdAt: doc.createdAt,
      }));

      return response(res, 200, true, "Drivers fetched successfully", {
        drivers: formattedDrivers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        isGrouped: false,
      });
  } catch (err) {
    console.error("Get driver list error:", err.message);
    return response(res, 500, false, "Failed to fetch drivers");
  }
};

export default getDriverList;
