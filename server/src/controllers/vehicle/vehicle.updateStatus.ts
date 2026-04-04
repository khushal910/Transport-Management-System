// @ts-nocheck
import Vehicle from '../../models/vehicle.schema';
import response from '../../response/response';
import mongoose from 'mongoose';

const updateVehicleStatus = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { status } = req.body;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return response(res, 401, false, 'Company ID is required');
    }

    if (!vehicleId) {
      return response(res, 400, false, 'Vehicle ID is required');
    }

    if (!status) {
      return response(res, 400, false, 'Status is required');
    }

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return response(res, 400, false, 'Invalid Vehicle ID');
    }

    // Valid vehicle statuses
    const validStatuses = ['available', 'on_trip', 'in_shop', 'retired'];
    if (!validStatuses.includes(status)) {
      return response(res, 400, false, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Verify vehicle belongs to the same company
    const vehicle = await Vehicle.findOne({ 
      _id: vehicleId, 
      company: companyId, 
      isDeleted: false 
    });

    if (!vehicle) {
      return response(res, 404, false, 'Vehicle not found or does not belong to your company');
    }

    // Update the vehicle status
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return response(res, 404, false, 'Vehicle not found');
    }

    return response(res, 200, true, `Vehicle status updated to ${status}`, {
      _id: updatedVehicle._id,
      licensePlate: updatedVehicle.licensePlate,
      status: updatedVehicle.status,
      updatedAt: updatedVehicle.updatedAt,
    });
  } catch (error) {
    console.error('Vehicle status update error:', error);
    return response(res, 500, false, 'Error updating vehicle status', error.message);
  }
};

export default updateVehicleStatus;
