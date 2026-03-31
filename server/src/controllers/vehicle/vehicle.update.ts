// @ts-nocheck
import Vehicle from '../../models/vehicle.schema';
import response from '../../response/response';
import vehicleUpdateSchema from '../../validations/vehicle.update.validator';
import mongoose from 'mongoose';

const vehicleUpdate = async (req, res) => {
  try {
    const updateData  = req.body;
    const { vehicleId } = req.params;
    const companyId = req.user.companyId;

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

    // Verify vehicle belongs to the same company
    const vehicle = await Vehicle.findOne({ _id: vehicleId, company: companyId, isDeleted: false });
    if (!vehicle) {
      return response(res, 404, false, 'Vehicle not found or does not belong to your company');
    }

    // Only allow editing vehicles with 'available' or 'retired' status
    // Status changes are managed through system lifecycle (trips, maintenance, etc.), not manual updates
    if (vehicle.status !== 'available' && vehicle.status !== 'retired') {
      return response(res, 403, false, `Cannot edit vehicle with status: '${vehicle.status}'. Only vehicles with 'available' or 'retired' status can be edited. Status is managed through system lifecycle events.`);
    }

    // Ensure status is never manually updated (only through lifecycle events)
    if (updateData.status) {
      return response(res, 403, false, 'Vehicle status cannot be manually changed. Status is managed through system lifecycle events (trips, maintenance, etc.).');
    }

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
  }
};

export default vehicleUpdate;

