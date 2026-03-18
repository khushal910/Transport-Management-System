import joi from 'joi';

const addEmployeeValidatorSchema = joi.object({
  name: joi.string().min(3).max(30).trim().required(),
  email: joi.string().email().trim().required(),
  password: joi.string().min(2).max(50).required(),
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
  // Driver-specific fields (required only when role is 'driver')
  licenseNumber: joi.when('role', {
    is: 'driver',
    then: joi.string().pattern(/^[A-Z0-9]+$/).required(),
    otherwise: joi.forbidden(),
  }),
  licenseExpiry: joi.when('role', {
    is: 'driver',
    then: joi.date().min('now').required().messages({
      'date.min': 'License expiry must be in the future',
    }),
    otherwise: joi.forbidden(),
  }),
  licenseCategory: joi.when('role', {
    is: 'driver',
    then: joi.string().valid('truck', 'van', 'bike').required(),
    otherwise: joi.forbidden(),
  }),
});

export default addEmployeeValidatorSchema;
