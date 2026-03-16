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
  // Company data (required only for managers)
  company: joi.when('role', {
    is: 'manager',
    then: joi.object({
      name: joi.string().min(3).max(100).trim().required(),
      registrationNumber: joi.string().min(1).max(50).trim().required(),
      address: joi.string().min(5).max(200).trim().required(),
      phone: joi.string().pattern(/^[0-9+\-\s()]+$/).min(7).max(20).trim().required(),
      email: joi.string().email().trim().required(),
    }).required(),
    otherwise: joi.forbidden(),
  }),
});

export default authValidatorSchema;
