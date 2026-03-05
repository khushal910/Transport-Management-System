import Vehicle from '../../models/vehicle.schema.js';
import response from '../../response/response.js';
import vehicleUpdateSchema from '../../validations/vehicle.update.validator.js';
import mongoose from 'mongoose';

const vehicleUpdate = async (req, res) => {
  try {
    const updateData  = req.body;

    const { vehicleId } = req.params;

    if (!vehicleId) {
      return response(res, 400, false, 'Vehicle ID is required');
    }

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return response(res, 400, false, 'Invalid Vehicle ID');
    }

    const { error, value } = vehicleUpdateSchema.validate(updateData, {
      abortEarly: false,
    });
    
    if (error)
      return response(
        res,
        400,
        false,
        'Invalid vehicle data',
        error.details.map((detail) => detail.message.replace(/"/g, ''))
      );

    const updatedVehicle = await Vehicle.findByIdAndUpdate(vehicleId, value, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updatedVehicle) {
      return response(res, 404, false, 'Vehicle not found');
    }

    response(res, 200, true, 'Vehicle updated successfully', updatedVehicle);
  } catch (error) {
    console.error('Vehicle update error:', error);
    response(res, 500, false, 'Error updating vehicle');
  }};

export default vehicleUpdate;
