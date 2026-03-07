import Vehicle from '../../models/vehicle.schema.js';
import response from '../../response/response.js';

const getVehicleList = async (req, res) => {
  try {
    const userID = req.user?.id;
    if (!userID) {
      return response(res, 401, false, 'User ID is required');
    }
   
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const listOfVehicles = await Vehicle.find({ createdBy: userID })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return response(
      res,
      200,
      true,
      'Vehicle list fetched successfully',
      listOfVehicles
    );
  } catch (error) {
    console.log('getVehicleList error:', error);
    return response(res, 500, false, 'Error fetching vehicle list');
  }
};

export default getVehicleList;
