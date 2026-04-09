// @ts-nocheck
import User from '../../models/user.schema';
import Driver from '../../models/driver.schema';
import response from '../../response/response';

const getEmployees = async (req, res) => {
  try {
    const managerCompanyId = req.user.companyId;

    if (!managerCompanyId) {
      return response(res, 400, false, 'Manager company not found');
    }

    console.log('[GetEmployees] Manager Company ID:', managerCompanyId);

    // Get all active employees in the manager's company, excluding managers
    const employees = await User.find({
      company: managerCompanyId,
      role: { $ne: 'manager' },
      isDeleted: false,
    }).select('-password');

    console.log('[GetEmployees] Found employees:', employees.length);
    if (employees.length === 0) {
      // Debug: Check what employees exist for debugging
      const allUsers = await User.find({ role: { $ne: 'manager' }, isDeleted: false });
      console.log('[GetEmployees] Total non-manager, non-deleted users in DB:', allUsers.length);
      const withCompany = await User.find({ company: { $exists: true }, role: { $ne: 'manager' }, isDeleted: false });
      console.log('[GetEmployees] Users with company field:', withCompany.length);
      if (withCompany.length > 0) {
        console.log('[GetEmployees] Sample company IDs:', withCompany.slice(0, 3).map(u => ({ id: u._id, company: u.company })));
      }
    }

    // For drivers, populate their driver status and ID
    const employeesWithStatus = await Promise.all(
      employees.map(async (employee) => {
        const emp = employee.toObject();
        
        if (emp.role === 'driver') {
          try {
            const driverData = await Driver.findOne({ user: employee._id }).select('_id status');
            if (driverData) {
              emp.status = driverData.status;
              emp.driverId = driverData._id;
            }
          } catch (err) {
            console.error(`Failed to fetch driver status for user ${employee._id}:`, err);
          }
        }
        
        return emp;
      })
    );

    return response(res, 200, true, 'Employees retrieved successfully', {
      employees: employeesWithStatus,
    });
  } catch (err) {
    console.error('Get employees error:', err);
    return response(res, 500, false, 'Failed to retrieve employees');
  }
};

export default getEmployees;

