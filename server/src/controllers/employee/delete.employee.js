import User from '../../models/user.schema.js';
import response from '../../response/response.js';

const deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const managerCompanyId = req.user.companyId;

    if (!employeeId) {
      return response(res, 400, false, 'Employee ID is required');
    }

    // Check if employee exists and belongs to manager's company
    const deletedEmployee = await User.findOneAndDelete({
      _id: employeeId,
      company: managerCompanyId,
      role: { $ne: 'manager' },
    });

    if (!deletedEmployee) {
      return response(res, 404, false, 'Employee not found');
    }

    return response(res, 200, true, 'Employee deleted successfully');
    return response(res, 200, true, 'Employee deleted successfully');
  } catch (err) {
    console.error('Delete employee error:', err.message);
    return response(res, 500, false, 'Failed to delete employee');
  }
};

export default deleteEmployee;
