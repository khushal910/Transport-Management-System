import response from "../../response/response.js";
import Trip from "../../models/trip.schema.js";
import Driver from "../../models/driver.schema.js";
import Vehicle from "../../models/vehicle.schema.js";
import FuelLog from "../../models/fuel.schema.js";

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

    // Update vehicle status and handle expense logic based on new status
    if (status === "completed") {
      await Vehicle.findByIdAndUpdate(trip.vehicle, { status: "available" });
      
      // Increment completedTrips and update driver status to off_duty
      const updatedDriver = await Driver.findByIdAndUpdate(
        trip.driver._id,
        {
          $inc: { completedTrips: 1 },
          status: "off_duty"
        },
        { new: true }
      );

      // Recalculate and update completion rate for the driver
      if (updatedDriver.assignedTrips > 0) {
        const completionRate = (updatedDriver.completedTrips / updatedDriver.assignedTrips) * 100;
        await Driver.findByIdAndUpdate(
          trip.driver._id,
          { completionRate: parseFloat(completionRate.toFixed(2)) }
        );
      }

      // AUTO-CREATE EXPENSE LOG when trip is completed
      // Calculate distance from trip odometers if available
      let distance = 0;
      if (trip.startOdometer && trip.endOdometer) {
        distance = trip.endOdometer - trip.startOdometer;
      }

      // Create FuelLog (Expense) record with pending status
      const expenseLog = await FuelLog.create({
        company: companyId,
        trip: tripId,
        driver: trip.driver._id,
        vehicle: trip.vehicle._id,
        fuelCost: 0, // User will fill this
        miscExpense: 0, // User will fill this
        distance: distance,
        status: "pending", // Will be updated to completed when user fills data
        date: new Date(),
      });

      console.info(`Auto-created expense log for trip ${tripId}: ${expenseLog._id}`);
    }

    // Handle cancelled trips - mark expenses as cancelled if they exist
    if (status === "cancelled") {
      // Mark any existing expenses for this trip as cancelled
      await FuelLog.updateMany(
        { trip: tripId, status: { $ne: "completed" } },
        { status: "cancelled" }
      );

      // Decrement assignedTrips for driver and set status to off_duty
      const cancelledDriver = await Driver.findByIdAndUpdate(
        trip.driver._id,
        {
          $inc: { assignedTrips: -1 },
          status: "off_duty"
        },
        { new: true }
      );

      // Recalculate and update completion rate for driver
      if (cancelledDriver.assignedTrips > 0) {
        const completionRate = (cancelledDriver.completedTrips / cancelledDriver.assignedTrips) * 100;
        await Driver.findByIdAndUpdate(
          trip.driver._id,
          { completionRate: parseFloat(completionRate.toFixed(2)) }
        );
      } else {
        // If no more assigned trips, reset completion rate to 0
        await Driver.findByIdAndUpdate(trip.driver._id, { completionRate: 0 });
      }

      // Set vehicle status back to available
      await Vehicle.findByIdAndUpdate(trip.vehicle, { status: "available" });
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
