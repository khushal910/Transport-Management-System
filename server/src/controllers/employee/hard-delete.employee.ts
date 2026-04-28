// @ts-nocheck
import User from '../../models/user.schema';
import Driver from '../../models/driver.schema';
import response from '../../response/response';

const hardDeleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const managerCompanyId = req.user.companyId;

    if (!employeeId) {
      return response(res, 400, false, 'Employee ID is required');
    }

    if (!managerCompanyId) {
      return response(res, 403, false, 'User is not associated with a company');
    }

    // Ensure the employee exists and is a soft-deleted non-manager in the same company
    const employee = await User.findOne({ _id: employeeId, company: managerCompanyId, role: { $ne: 'manager' }, isDeleted: true });

    if (!employee) {
      return response(res, 404, false, 'Deleted employee not found');
    }

    // Remove driver profile if exists
    try {
      await Driver.deleteOne({ user: employee._id });
    } catch (err) {
      console.warn('Failed to delete related driver document:', err.message || err);
    }

    // Finally remove user document permanently
    await User.deleteOne({ _id: employee._id });

    return response(res, 200, true, 'Employee permanently deleted');
  } catch (err) {
    console.error('Hard delete employee error:', err);
    return response(res, 500, false, 'Failed to permanently delete employee');
  }
};

export default hardDeleteEmployee;
