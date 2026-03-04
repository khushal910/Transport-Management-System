import joi from 'joi';

const authValidatorSchema = joi.object({
  name: joi.string().min(3).max(30).trim().required(),
  email: joi.string().email().trim().required(),
  password: joi.string().min(3).max(50).trim().required(),
  role: joi
    .string()
    .lowercase()
    .valid(
      'manager',
      'driver',
      'dispatcher',
      'safety_officer',
      'financial_analyst'
    )
    .required(),
});

export default authValidatorSchema;
