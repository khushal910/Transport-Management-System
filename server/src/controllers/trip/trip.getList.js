import Trip from "../../models/trip.schema.js";
import response from "../../response/response.js";

const getTripList = async (req, res) => {
    try {

      const companyId = req.user.companyId;
      
      if (!companyId) {
        return response(res, 401, false, 'Company ID is required');
      }

      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const skip = (page - 1) * limit;

      const trips = await Trip.find({ company: companyId })
        .populate('vehicle')
        .populate('driver')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return response(res, 200, true, 'Trip list fetched successfully', trips);

    } catch (error) {
        // Use a proper logger (e.g., winston, pino) in production
        console.error('getTripList error:', error);
        return response(res, 500, false, 'Error getting trip list');
        }

};

export default getTripList;