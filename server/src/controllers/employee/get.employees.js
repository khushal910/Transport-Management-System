import User from '../../models/user.schema.js';
import response from '../../response/response.js';

const getEmployees = async (req, res) => {
  try {
    const managerCompanyId = req.user.companyId;

    if (!managerCompanyId) {
      return response(res, 400, false, 'Manager company not found');
    }

    // Get all employees in the manager's company, excluding managers
    const employees = await User.find({
      company: managerCompanyId,
      role: { $ne: 'manager' },
    }).select('-password');

    return response(res, 200, true, 'Employees retrieved successfully', {
      employees,
    });
  } catch (err) {
    console.error('Get employees error:', err);
    return response(res, 500, false, 'Failed to retrieve employees');
  }
};

export default getEmployees;
