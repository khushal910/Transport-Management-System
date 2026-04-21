// @ts-nocheck
import User from '../../models/user.schema';
import response from '../../response/response';
import { sendEmployeeRecoveredEmail } from '../../utils/email.service';

const recoverEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const managerCompanyId = req.user.companyId;

    if (!employeeId) {
      return response(res, 400, false, 'Employee ID is required');
    }

    if (!managerCompanyId) {
      return response(res, 403, false, 'User is not associated with a company');
    }

    const recoveredEmployee = await User.findOneAndUpdate(
      { _id: employeeId, company: managerCompanyId, role: { $ne: 'manager' }, isDeleted: true },
      { isDeleted: false },
      { new: true }
    )
      .select('-password')
      .populate('company', 'name');

    if (!recoveredEmployee) {
      return response(res, 404, false, 'Deleted employee not found');
    }

    await sendEmployeeRecoveredEmail(
      recoveredEmployee.email,
      recoveredEmployee.name,
      (recoveredEmployee.company as any)?.name || 'your company'
    );

    return response(res, 200, true, 'Employee recovered successfully', recoveredEmployee);
  } catch (err) {
    console.error('Recover employee error:', err);
    return response(res, 500, false, 'Failed to recover employee');
  }
};

export default recoverEmployee;
