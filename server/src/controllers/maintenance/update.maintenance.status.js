import response from "../../response/response.js";
import MaintenanceLog from "../../models/maintenance.schema.js";
import Vehicle from "../../models/vehicle.schema.js";

const updateMaintenanceStatus = async (req, res) => {
  try {
    const { maintenanceId } = req.params;
    const { status } = req.body;
    const userRole = req.user.role;
    const companyId = req.user.companyId;

    // Only manager and safety_officer can update status
    if (!["manager", "safety_officer"].includes(userRole)) {
      return response(
        res,
        403,
        false,
        "Only manager or safety officer can update maintenance status"
      );
    }

    // Validate status value
    if (!status || !["pending", "completed", "cancelled"].includes(status)) {
      return response(res, 400, false, "Invalid status value");
    }

    // Find maintenance record
    const maintenance = await MaintenanceLog.findById(maintenanceId).populate("vehicle");
    if (!maintenance) {
      return response(res, 404, false, "Maintenance service not found");
    }

    // Check if belongs to same company
    if (maintenance.company.toString() !== companyId.toString()) {
      return response(res, 403, false, "Unauthorized: Service does not belong to your company");
    }

    const currentStatus = maintenance.status;

    // Check for invalid status transitions
    if (currentStatus === "cancelled") {
      return response(res, 400, false, "Cannot change status of a cancelled service");
    }

    if (currentStatus === "completed" && status !== "completed") {
      return response(res, 400, false, "Cannot change status of a completed service");
    }

    // Update vehicle status based on maintenance status transition
    if (currentStatus !== status) {
      if (status === "completed") {
        // When service is completed, set vehicle status to available if it was in shop
        if (maintenance.vehicle.status === "in_shop") {
          await Vehicle.findByIdAndUpdate(maintenance.vehicle._id, {
            status: "available",
          });
        }
      } else if (status === "cancelled") {
        // When cancelled, set vehicle status to available if it was in shop
        if (maintenance.vehicle.status === "in_shop") {
          await Vehicle.findByIdAndUpdate(maintenance.vehicle._id, {
            status: "available",
          });
        }
      }
    }

    // Update maintenance status
    const updatedMaintenance = await MaintenanceLog.findByIdAndUpdate(
      maintenanceId,
      { status },
      { new: true }
    ).populate("vehicle");

    return response(
      res,
      200,
      true,
      `Maintenance status updated to ${status}`,
      updatedMaintenance
    );
  } catch (error) {
    console.error("Error updating maintenance status:", error);
    return response(res, 500, false, "Internal server error");
  }
};

export default updateMaintenanceStatus;
