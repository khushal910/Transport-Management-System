// @ts-nocheck
import response from '../../response/response';
import User from '../../models/user.schema';
import Driver from '../../models/driver.schema';
import Vehicle from '../../models/vehicle.schema';
import joi from 'joi';

const assignVehicleSchema = joi.object({
  driverId: joi.string().required().messages({
    'string.empty': 'Driver ID is required',
    'any.required': 'Driver ID is required',
  }),
  vehicleId: joi.string().required().messages({
    'string.empty': 'Vehicle ID is required',
    'any.required': 'Vehicle ID is required',
  }),
});

const assignVehicleToDriver = async (req, res) => {
  try {
    // Validate input
    const { error, value } = assignVehicleSchema.validate(req.body);

    if (error) {
      return response(res, 400, false, error.details[0].message.replace(/"/g, ''));
    }

    const { driverId, vehicleId } = value;
    const managerCompanyId = req.user.company;

    // Get the driver with company information
    const driver = await Driver.findById(driverId).populate({
      path: 'user',
      select: 'company',
    });

    if (!driver) {
      return response(res, 404, false, 'Driver not found');
    }

    // Verify driver belongs to the manager's company
    const driverUser = driver.user as any;
    if (String(driverUser.company) !== String(managerCompanyId)) {
      return response(res, 403, false, 'You can only assign vehicles to drivers in your company');
    }

    // Get vehicle and verify it belongs to the manager's company
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return response(res, 404, false, 'Vehicle not found');
    }

    if (String(vehicle.company) !== String(managerCompanyId)) {
      return response(res, 403, false, 'You can only assign vehicles from your company');
    }

    // Check if vehicle is already assigned to another driver
    const existingAssignment = await Driver.findOne({
      assignedVehicle: vehicleId,
      _id: { $ne: driverId },
    });

    if (existingAssignment) {
      return response(res, 409, false, 'Vehicle is already assigned to another driver');
    }

    // Check if vehicle status is active
    if (vehicle.status !== 'active') {
      return response(res, 400, false, `Vehicle status is ${vehicle.status}, only active vehicles can be assigned`);
    }

    // If driver already has an assigned vehicle, remove it first
    if (driver.assignedVehicle && String(driver.assignedVehicle) !== vehicleId) {
      // Vehicle can now be unassigned
      console.info(`[AssignVehicle] Reassigning vehicle for driver ${driverId}`);
    }

    // Assign vehicle to driver
    driver.assignedVehicle = vehicleId;
    await driver.save();

    // Populate full details for response
    await driver.populate([
      { path: 'user', select: 'name email role' },
      { path: 'assignedVehicle', select: 'registrationNumber model make' },
    ]);

    return response(res, 200, true, 'Vehicle assigned to driver successfully', {
      driverId: driver._id,
      driverName: (driver.user as any).name,
      vehicleId: vehicleId,
      vehicleNumber: vehicle.registrationNumber,
      message: `${vehicle.registrationNumber} successfully assigned to ${(driver.user as any).name}`,
    });
  } catch (err) {
    console.error('❌ Assign Vehicle Error:', err.message);
    return response(res, 500, false, 'Failed to assign vehicle. Please try again.');
  }
};

export default assignVehicleToDriver;
