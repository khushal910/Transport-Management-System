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

    // add search functionality     
    const search = req.query.search;
    if (search && typeof search !== 'string') {
      return response(res, 400, false, 'Search query must be a string');
    }

    const query = {
      createdBy: userID,
    };

    if (search) {
      query.$text = { $search: search };
    }
     const listOfVehicles = await Vehicle.find(query)      .sort({ createdAt: -1 })
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
    if (error.codeName === 'IndexNotFound') {
      return response(res, 200, true, 'Vehicle list fetched successfully', []);
    }

      console.log('getVehicleList error:', error);
      return response(res, 500, false, 'Error fetching vehicle list');
    
  }
};

export default getVehicleList;
