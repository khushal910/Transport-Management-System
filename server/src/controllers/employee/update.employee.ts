// @ts-nocheck
import User from '../../models/user.schema';
import response from '../../response/response';
import updateEmployeeValidatorSchema from '../../validations/update.employee.validator';
import { sendEmployeeDetailsUpdatedEmail } from '../../utils/email.service';
import bcrypt from 'bcryptjs';

const updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Validate request body with Joi
    const { error, value } = updateEmployeeValidatorSchema.validate(req.body);
    if (error) {
      return response(res, 400, false, error.details[0].message.replace(/"/g, ""));
    }

    const { name, email, role, password } = value;
    const managerCompanyId = req.user.companyId;

    if (!employeeId) {
      return response(res, 400, false, 'Employee ID is required');
    }

    // Check if employee exists and belongs to manager's company
    const employee = await User.findOne({
      _id: employeeId,
      company: managerCompanyId,
      role: { $ne: 'manager' },
    });

    if (!employee) {
      return response(res, 404, false, 'Employee not found');
    }

    // Check if email is already taken (if being updated)
    if (email && email !== employee.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return response(res, 400, false, 'Email already exists');
      }
    }

    // Update fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) {
      if (role === 'manager') {
        return response(res, 400, false, 'Cannot assign manager role');
      }
      updateData.role = role;
    }    
    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedEmployee = await User.findByIdAndUpdate(
      employeeId,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedEmployee) {
      return response(res, 404, false, 'Employee not found');
    }

    // Send email notification about updated details
    const updatedFields: any = {};
    if (updateData.name) updatedFields.name = updateData.name;
    if (updateData.email) updatedFields.email = updateData.email;
    if (updateData.role) updatedFields.role = updateData.role;
    if (updateData.password) updatedFields.password = true;

    // Only send email if there are updates
    if (Object.keys(updatedFields).length > 0) {
      await sendEmployeeDetailsUpdatedEmail(updatedEmployee.email, updatedEmployee.name, updatedFields);
    }

    return response(res, 200, true, 'Employee updated successfully', {
      id: updatedEmployee._id,
      name: updatedEmployee.name,
      email: updatedEmployee.email,
      role: updatedEmployee.role,
      companyId: updatedEmployee.company,
    });  } catch (err) {
    if (err.code === 11000) {
      return response(res, 400, false, 'Email already exists');
    }

    console.error('Update employee error:', err.message);
    return response(res, 500, false, 'Failed to update employee');
  }
};

export default updateEmployee;

