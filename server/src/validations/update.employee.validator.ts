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
}).min(1); // At least one field must be provided

export default updateEmployeeValidatorSchema;
