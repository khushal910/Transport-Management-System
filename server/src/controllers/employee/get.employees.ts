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

    // Get all employees in the manager's company, excluding managers
    const employees = await User.find({
      company: managerCompanyId,
      role: { $ne: 'manager' },
    }).select('-password');

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

