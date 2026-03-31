// @ts-nocheck
import response from '../../response/response';
import Vehicle from '../../models/vehicle.schema';

const deleteVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;
    const companyId = req.user.companyId;

    if (!vehicleId) {
      return response(res, 400, false, 'Vehicle ID is required');
    }

    if (!companyId) {
      return response(res, 403, false, 'User is not associated with a company');
    }

    // First, fetch the vehicle to check its status
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      company: companyId,
      isDeleted: false,
    });

    if (!vehicle) {
      return response(
        res,
        404,
        false,
        'Vehicle not found or does not belong to your company'
      );
    }

    // Validate vehicle status - can only delete if status is "retired" or "available"
    if (vehicle.status !== 'retired' && vehicle.status !== 'available') {
      return response(
        res,
        400,
        false,
        `Cannot delete vehicle with status ${vehicle.status}`
      );
    }

    // Soft delete: mark as deleted instead of hard deleting
    const deletedVehicle = await Vehicle.findOneAndUpdate(
      {
        _id: vehicleId,
        company: companyId,
        isDeleted: false,
      },
      { isDeleted: true },
      { new: true }
    );

    if (!deletedVehicle) {
      return response(
        res,
        404,
        false,
        'Vehicle not found or does not belong to your company'
      );
    }

    return response(res, 200, true, 'Vehicle deleted successfully');
  } catch (error) {
    console.log('deleteVehicle error:', error);
    return response(res, 500, false, 'Error deleting vehicle');
  }
};

export default deleteVehicle;

