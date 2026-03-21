import response from "../../response/response.js";
import Trip from "../../models/trip.schema.js";
import Driver from "../../models/driver.schema.js";
import Vehicle from "../../models/vehicle.schema.js";

const updateTripStatus = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { status } = req.body;
    const userRole = req.user.role;
    const userId = req.user.userId;
    const companyId = req.user.companyId;

    // Validate status value
    if (!status || !["draft", "dispatched", "completed", "cancelled"].includes(status)) {
      return response(res, 400, false, "Invalid status value");
    }

    // Check if trip exists
    const trip = await Trip.findById(tripId).populate("driver");
    if (!trip) {
      return response(res, 404, false, "Trip not found");
    }

    // Check if trip belongs to the same company
    if (trip.company.toString() !== companyId.toString()) {
      return response(res, 403, false, "Unauthorized: Trip does not belong to your company");
    }

    const currentStatus = trip.status;

    // Handle draft -> dispatched transition (only Manager or Dispatcher)
    if (currentStatus === "draft" && status === "dispatched") {
      if (!["manager", "dispatcher"].includes(userRole)) {
        return response(
          res,
          403,
          false,
          "Only manager or dispatcher can dispatch trips from draft status"
        );
      }
    }
    // Handle dispatched -> completed transition (only Driver, Dispatcher, or Manager)
    else if (currentStatus === "dispatched" && status === "completed") {
      if (userRole === "driver") {
        // If user is driver, check if they are the driver assigned to this trip
        const driverRecord = await Driver.findOne({ user: userId });
        if (!driverRecord || driverRecord._id.toString() !== trip.driver._id.toString()) {
          return response(
            res,
            403,
            false,
            "You are not assigned to this trip and cannot mark it as completed"
          );
        }
      } else if (!["dispatcher", "manager"].includes(userRole)) {
        return response(
          res,
          403,
          false,
          "Only driver, dispatcher, or manager can mark trips as completed"
        );
      }
    }
    // Handle other transitions
    else if (currentStatus !== status) {
      return response(
        res,
        400,
        false,
        `Cannot transition from ${currentStatus} to ${status}`
      );
    }
    // If same status, just return success
    else {
      return response(res, 200, true, "Trip already has this status", trip);
    }

    // Update vehicle status if transitioning to completed
    if (status === "completed") {
      await Vehicle.findByIdAndUpdate(trip.vehicle, { status: "available" });
      await Driver.findByIdAndUpdate(trip.driver._id, { status: "off_duty" });
    }

    // Update the trip status
    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      { status },
      { new: true }
    )
      .populate("vehicle")
      .populate("driver");

    return response(res, 200, true, `Trip status updated to ${status}`, updatedTrip);
  } catch (error) {
    console.error("Error updating trip status:", error);
    return response(res, 500, false, "Internal server error");
  }
};

export default updateTripStatus;
