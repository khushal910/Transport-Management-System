import joi, { ObjectSchema } from 'joi';
import environmentConfig from '../config/environment';

// Dynamic password validation based on environment
const getPasswordValidationRule = () => {
  if (environmentConfig.isDevelopment) {
    // Development: minimal password requirement
    return joi.string().min(1).max(50).trim().required().messages({
      'string.min': 'Password must be at least 1 character (Development Mode)',
    });
  }
  // Production: strict password requirement
  return joi
    .string()
    .min(6)
    .max(50)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[!@#$%^&*]/)
    .trim()
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.pattern.base':
        'Password must contain uppercase, lowercase, number, and special character',
    });
};

const authValidatorSchema: ObjectSchema = joi.object({
  name: joi.string().min(3).max(30).trim().required(),
  email: joi.string().email().trim().required(),
  password: getPasswordValidationRule(),
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
