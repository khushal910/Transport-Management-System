import response from '../../response/response.js';
import Vehicle from '../../models/vehicle.schema.js';

const deleteVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;
    if (!vehicleId) {
      return response(res, 400, false, 'Vehicle ID is required');
    }

    const userID = req.user.id;
    if (!userID) {
      return response(res, 401, false, 'Unauthorized');
    }

    const deletedVehicle = await Vehicle.findOneAndDelete({
      _id: vehicleId,
      createdBy: userID,
    });
    if (!deletedVehicle) {
      return response(
        res,
        404,
        false,
        'Vehicle not found or you do not have permission to delete it'
      );
    }

    return response(res, 200, true, 'Vehicle deleted successfully');
  } catch (error) {
    console.log('deleteVehicle error:', error);
    return response(res, 500, false, 'Error deleting vehicle');
  }
};

export default deleteVehicle;
