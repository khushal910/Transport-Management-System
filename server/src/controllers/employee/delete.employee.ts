// @ts-nocheck
import User from '../../models/user.schema';
import Company from '../../models/company.schema';
import response from '../../response/response';
import { sendEmployeeDeletedEmail } from '../../utils/email.service';

const deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const managerCompanyId = req.user.companyId;

    if (!employeeId) {
      return response(res, 400, false, 'Employee ID is required');
    }

    // Find employee before deletion to get their details for the email
    const employee = await User.findOne({
      _id: employeeId,
      company: managerCompanyId,
      role: { $ne: 'manager' },
    }).populate('company', 'name');

    if (!employee) {
      return response(res, 404, false, 'Employee not found');
    }

    // Delete the employee
    await User.findByIdAndDelete(employeeId);

    // Send deletion notification email
    await sendEmployeeDeletedEmail(employee.email, employee.name, employee.company.name);

    return response(res, 200, true, 'Employee deleted successfully');
  } catch (err) {
    console.error('Delete employee error:', err.message);
    return response(res, 500, false, 'Failed to delete employee');
  }
};

export default deleteEmployee;

