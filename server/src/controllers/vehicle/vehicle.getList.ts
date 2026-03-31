// @ts-nocheck
import Vehicle from '../../models/vehicle.schema';
import response from '../../response/response';
import { DEFAULT_LIMIT, MAX_LIMIT } from '../../config/paginationConfig';

const getVehicleList = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return response(res, 401, false, 'Unauthorized: Company ID is required');
    }   
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    // add search functionality     
    const search = req.query.search;
    if (search && typeof search !== 'string') {
      return response(res, 400, false, 'Search query must be a string');
    }

    const query = {
      company: companyId,
      isDeleted: false,
    };

    if (search) {
      query.$text = { $search: search };
    }
    
    const listOfVehicles = await Vehicle.find(query)
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
    if (error.codeName === 'IndexNotFound') {
      return response(res, 200, true, 'Vehicle list fetched successfully', []);
    }

    console.log('getVehicleList error:', error);
    return response(res, 500, false, 'Error fetching vehicle list');
  }
};

export default getVehicleList;

