import response from '../../response/response.js';
import Vehicle from '../../models/vehicle.schema.js';

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
    const deletedVehicle = await Vehicle.findOneAndDelete({
      _id: vehicleId,
      company: companyId,
    });

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
