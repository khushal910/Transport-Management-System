// @ts-nocheck
import response from '../../response/response';
import User from '../../models/user.schema';
import Driver from '../../models/driver.schema';
import joi from 'joi';

const removeVehicleSchema = joi.object({
  driverId: joi.string().required().messages({
    'string.empty': 'Driver ID is required',
    'any.required': 'Driver ID is required',
  }),
});

const removeVehicleFromDriver = async (req, res) => {
  try {
    // Validate input
    const { error, value } = removeVehicleSchema.validate(req.body);

    if (error) {
      return response(res, 400, false, error.details[0].message.replace(/"/g, ''));
    }

    const { driverId } = value;
    const managerCompanyId = req.user.company;

    // Get the driver with company information
    const driver = await Driver.findById(driverId).populate([
      { path: 'user', select: 'company name' },
      { path: 'assignedVehicle', select: 'registrationNumber' },
    ]);

    if (!driver) {
      return response(res, 404, false, 'Driver not found');
    }

    // Verify driver belongs to the manager's company
    const driverUser = driver.user as any;
    if (String(driverUser.company) !== String(managerCompanyId)) {
      return response(res, 403, false, 'You can only remove vehicles from drivers in your company');
    }

    // Check if driver has an assigned vehicle
    if (!driver.assignedVehicle) {
      return response(res, 400, false, 'Driver does not have an assigned vehicle');
    }

    const previousVehicle = (driver.assignedVehicle as any).registrationNumber;

    // Remove vehicle assignment
    driver.assignedVehicle = null;
    await driver.save();

    return response(res, 200, true, 'Vehicle removed from driver successfully', {
      driverId: driver._id,
      driverName: driverUser.name,
      message: `${previousVehicle} successfully removed from ${driverUser.name}`,
    });
  } catch (err) {
    console.error('❌ Remove Vehicle Error:', err.message);
    return response(res, 500, false, 'Failed to remove vehicle. Please try again.');
  }
};

export default removeVehicleFromDriver;
