import Vehicle from "../../models/vehicle.schema.js";
import MaintenanceLog from "../../models/maintenance.schema.js";
import response from "../../response/response.js";
import maintenanceCreateSchema from "../../validations/maintenance.create.validator.js";

const createMaintenance = async (req, res) => {
  try {
    const { error, value } = maintenanceCreateSchema.validate(req.body);

    if (error) {
      return response(res, 400, false, error.details[0].message.replace(/"/g, ""));
    }

    const { vehicleName, description, serviceDate, cost, distance } = value;
    const companyId = req.user.companyId;

    if (!companyId) {
      return response(res, 401, false, "Company ID is required");
    }

    // Find vehicle by name and company
    const vehicle = await Vehicle.findOne({
      name: vehicleName,
      company: companyId,
    }, "_id");

    if (!vehicle) {
      return response(res, 404, false, "Vehicle not found");
    }

    // Create maintenance log
    const maintenanceLog = await MaintenanceLog.create({
      company: companyId,
      vehicle: vehicle._id,
      description,
      serviceDate: new Date(serviceDate),
      status: "pending",
      cost: Number(cost),
      distance: Number(distance) || 0,
    });

    // Update vehicle status to in_shop
    await Vehicle.findByIdAndUpdate(vehicle._id, { status: "in_shop" });

    return response(res, 201, true, "Maintenance service created successfully", {
      logId: maintenanceLog._id,
      vehicle: vehicleName,
      description: maintenanceLog.description,
      serviceDate: maintenanceLog.serviceDate,
      status: maintenanceLog.status,
      cost: maintenanceLog.cost,
      distance: maintenanceLog.distance,
    });
  } catch (error) {
    console.error("Error creating maintenance:", error);
    return response(res, 500, false, "Failed to create maintenance service");
  }
};

export default createMaintenance;
