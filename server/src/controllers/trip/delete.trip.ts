// @ts-nocheck
import response from '../../response/response.js';
import Trip from '../../models/trip.schema.js';
import Vehicle from '../../models/vehicle.schema.js';
import Driver from '../../models/driver.schema.js';

const deleteTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const companyId = req.user.companyId;

    // Check if trip exists
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return response(res, 404, false, "Trip not found");
    }

    // Check if trip belongs to the same company
    if (trip.company.toString() !== companyId.toString()) {
      return response(res, 403, false, "Unauthorized: Trip does not belong to your company");
    }

    // Check if trip status is draft or dispatched (only these can be deleted)
    if (!["draft", "dispatched"].includes(trip.status)) {
      return response(
        res,
        400,
        false,
        `Cannot delete trip with status: ${trip.status}. Only draft or dispatched trips can be deleted.`
      );
    }

    // Get vehicle and driver references before deletion
    const vehicleId = trip.vehicle;
    const driverId = trip.driver;

    // Delete the trip
    await Trip.findByIdAndDelete(tripId);

    // Update vehicle status back to available
    await Vehicle.findOneAndUpdate(
      { _id: vehicleId, isDeleted: false },
      { status: "available" }
    );

    // Update driver status back to off_duty
    await Driver.findByIdAndUpdate(driverId, { status: "off_duty" });

    return response(res, 200, true, "Trip deleted successfully");
  } catch (error) {
    console.error("Error deleting trip:", error);
    return response(res, 500, false, "Internal server error");
  }
};

export default deleteTrip;

