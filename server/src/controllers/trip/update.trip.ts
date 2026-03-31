// @ts-nocheck
import response from '../../response/response.js';
import Trip from '../../models/trip.schema.js';
import User from '../../models/user.schema.js';
import Driver from '../../models/driver.schema.js';
import Vehicle from '../../models/vehicle.schema.js';
import tripCreateSchema from '../../validations/trip.create.validator.js';
import { DRIVER_STATUS } from '../../constants/driverStatus.constants.js';
import { validateDriverForAssignment, createStatusChangeRecord } from '../../utils/driverStatusManager.js';

const updateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const companyId = req.user.companyId;

    // Check if trip exists
    const existingTrip = await Trip.findById(tripId);
    if (!existingTrip) {
      return response(res, 404, false, "Trip not found");
    }

    // Check if trip belongs to the same company
    if (existingTrip.company.toString() !== companyId.toString()) {
      return response(res, 403, false, "Unauthorized: Trip does not belong to your company");
    }

    // Check if trip status is draft or dispatched (only these can be updated)
    if (!["draft", "dispatched"].includes(existingTrip.status)) {
      return response(
        res,
        400,
        false,
        `Cannot update trip with status: ${existingTrip.status}. Only draft or dispatched trips can be updated.`
      );
    }

    // Validate input
    const { error, value } = tripCreateSchema.validate(req.body);
    if (error) {
      return response(res, 400, false, error.details[0].message.replace(/"/g, ""));
    }

    const { vehiclePlateNumber, driverEmail, cargoWeight, startLocation, endLocation, revenue } = value;

    // Check if vehicle exists and belongs to the same company
    const newVehicle = await Vehicle.findOne(
      { licensePlate: vehiclePlateNumber, company: companyId, isDeleted: false },
      "_id status maxCapacity"
    );

    if (!newVehicle) {
      return response(res, 404, false, "Vehicle not found");
    }

    // Check if cargo weight exceeds new vehicle capacity
    if (newVehicle.maxCapacity < cargoWeight) {
      return response(res, 400, false, "Cargo weight exceeds vehicle capacity");
    }

    // Check if driver exists and belongs to the same company
    const newDriverUser = await User.findOne(
      { email: driverEmail, role: "driver", company: companyId },
      "_id"
    ).lean();

    if (!newDriverUser) {
      return response(res, 404, false, "Driver not found");
    }

    // Check if driver record exists in Driver table
    const newDriver = await Driver.findOne({ user: newDriverUser._id }, "_id status");

    if (!newDriver) {
      return response(res, 404, false, "Driver record not found");
    }

    // Validate new driver can be assigned
    try {
      validateDriverForAssignment(newDriver.status);
    } catch (error) {
      return response(res, 400, false, error.message);
    }

    // If changing driver, check if new driver is not already assigned to other trips
    if (newDriver._id.toString() !== existingTrip.driver.toString()) {
      const isDriverAssigned = await Trip.findOne({
        _id: { $ne: tripId },
        driver: newDriver._id,
        status: { $in: ["draft", "dispatched"] },
      });

      if (isDriverAssigned) {
        return response(res, 400, false, "Driver is already assigned to another trip");
      }

      // If changing driver, revert the old driver status and metrics
      // Create status change record for audit trail - unassigning from trip
      const oldDriverStatusChange = createStatusChangeRecord(
        DRIVER_STATUS.ON_TRIP,
        DRIVER_STATUS.AVAILABLE,
        'automatic_trip_update_driver_change',
        null // System automatic change
      );

      const oldDriver = await Driver.findByIdAndUpdate(
        existingTrip.driver,
        {
          $inc: { assignedTrips: -1 },
          status: DRIVER_STATUS.AVAILABLE,
          lastStatusChange: new Date(),
          $push: { statusHistory: oldDriverStatusChange }
        },
        { new: true }
      );

      // Recalculate completion rate for old driver
      if (oldDriver.assignedTrips > 0) {
        const newCompletionRate = (oldDriver.completedTrips / oldDriver.assignedTrips) * 100;
        await Driver.findByIdAndUpdate(
          existingTrip.driver,
          { completionRate: parseFloat(newCompletionRate.toFixed(2)) }
        );
      } else {
        // If no more assigned trips, reset completion rate to 0
        await Driver.findByIdAndUpdate(existingTrip.driver, { completionRate: 0 });
      }

      // Create status change record for new driver - assigning to trip
      const newDriverStatusChange = createStatusChangeRecord(
        newDriver.status,
        DRIVER_STATUS.ON_TRIP,
        'automatic_trip_update_driver_assign',
        null // System automatic change
      );

      // Increment assignedTrips for new driver and set status to ON_TRIP
      const updatedNewDriver = await Driver.findByIdAndUpdate(
        newDriver._id,
        {
          $inc: { assignedTrips: 1 },
          status: DRIVER_STATUS.ON_TRIP,
          lastStatusChange: new Date(),
          $push: { statusHistory: newDriverStatusChange }
        },
        { new: true }
      );

      // Recalculate completion rate for new driver
      if (updatedNewDriver.assignedTrips > 0) {
        const newCompletionRate = (updatedNewDriver.completedTrips / updatedNewDriver.assignedTrips) * 100;
        await Driver.findByIdAndUpdate(
          newDriver._id,
          { completionRate: parseFloat(newCompletionRate.toFixed(2)) }
        );
      }
    }

    // If changing vehicle, revert the old vehicle status
    if (newVehicle._id.toString() !== existingTrip.vehicle.toString()) {
      await Vehicle.findByIdAndUpdate(existingTrip.vehicle, { status: "available" });
      // Set new vehicle status to assigned
      await Vehicle.findByIdAndUpdate(newVehicle._id, { status: "assigned" });
    }

    // Update the trip
    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      {
        vehicle: newVehicle._id,
        driver: newDriver._id,
        cargoWeight,
        startLocation,
        endLocation,
        revenue,
      },
      { new: true }
    )
      .populate("vehicle")
      .populate("driver");

    return response(res, 200, true, "Trip updated successfully", updatedTrip);
  } catch (error) {
    console.error("Error updating trip:", error);
    return response(res, 500, false, "Failed to update trip");
  }
};

export default updateTrip;

