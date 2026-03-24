import Vehicle from "../../models/vehicle.schema.js";
import response from "../../response/response.js";

const recoverVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;
    const companyId = req.user.companyId;

    if (!vehicleId) {
      return response(res, 400, false, "Vehicle ID is required");
    }

    if (!companyId) {
      return response(res, 403, false, "User is not associated with a company");
    }

    // Find the deleted vehicle
    const deletedVehicle = await Vehicle.findOne({
      _id: vehicleId,
      company: companyId,
      isDeleted: true,
    });

    if (!deletedVehicle) {
      return response(res, 404, false, "Deleted vehicle not found");
    }

    // Recover the vehicle by setting isDeleted to false
    const recoveredVehicle = await Vehicle.findOneAndUpdate(
      { _id: vehicleId, company: companyId, isDeleted: true },
      { isDeleted: false },
      { new: true }
    );

    return response(
      res,
      200,
      true,
      "Vehicle recovered successfully",
      recoveredVehicle
    );
  } catch (error) {
    console.error("Error recovering vehicle:", error);
    return response(res, 500, false, "Internal server error");
  }
};

export default recoverVehicle;
