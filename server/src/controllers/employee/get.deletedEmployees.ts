// @ts-nocheck
import User from '../../models/user.schema';
import response from '../../response/response';
import { DEFAULT_LIMIT, MAX_LIMIT } from '../../config/paginationConfig';

const getDeletedEmployees = async (req, res) => {
  try {
    const managerCompanyId = req.user.companyId;
    const { page = '1', limit = String(DEFAULT_LIMIT), search = '' } = req.query;

    if (!managerCompanyId) {
      return response(res, 403, false, 'User is not associated with a company');
    }

    const requestedPage = Math.max(1, parseInt(page as string, 10) || 1);
    const requestedLimit = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit as string, 10) || DEFAULT_LIMIT));
    const skip = (requestedPage - 1) * requestedLimit;

    const query: any = {
      company: managerCompanyId,
      role: { $ne: 'manager' },
      isDeleted: true,
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }

    const [deletedEmployees, totalDeleted] = await Promise.all([
      User.find(query)
        .skip(skip)
        .limit(requestedLimit)
        .select('-password')
        .lean(),
      User.countDocuments(query),
    ]);

    if (deletedEmployees.length === 0) {
      // No deleted employees found
    }

    return response(res, 200, true, 'Deleted employees retrieved successfully', {
      deletedEmployees,
      total: totalDeleted,
      page: requestedPage,
      limit: requestedLimit,
    });
  } catch (err) {
    console.error('Get deleted employees error:', err);
    return response(res, 500, false, 'Failed to retrieve deleted employees');
  }
};

export default getDeletedEmployees;
