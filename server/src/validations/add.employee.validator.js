import joi from 'joi';

const addEmployeeValidatorSchema = joi.object({
  name: joi.string().min(3).max(30).trim().required(),
  email: joi.string().email().trim().required(),
  password: joi.string().min(6).max(50).required(),
  role: joi
    .string()
    .lowercase()
    .valid(
      'driver',
      'dispatcher',
      'safety_officer',
      'financial_analyst'
    )
    .required(),
});

export default addEmployeeValidatorSchema;
