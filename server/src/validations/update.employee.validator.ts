import joi, { ObjectSchema } from 'joi';

const updateEmployeeValidatorSchema: ObjectSchema = joi.object({
  name: joi.string().min(3).max(30).trim().optional(),
  email: joi.string().email().trim().optional(),
  password: joi.string().min(2).max(50).optional(),
  role: joi
    .string()
    .lowercase()
    .valid(
      'driver',
      'dispatcher',
      'safety_officer',
      'financial_analyst'
    )
    .optional(),
  licenseNumber: joi.string().alphanum().min(5).max(20).optional(),
  licenseExpiry: joi.date().iso().optional(),
  licenseCategory: joi.string().valid('truck', 'van', 'bike').optional(),
}).min(1); // At least one field must be provided

export default updateEmployeeValidatorSchema;
