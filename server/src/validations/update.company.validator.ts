import joi, { ObjectSchema } from 'joi';

const updateCompanyValidatorSchema: ObjectSchema = joi.object({
  name: joi.string().min(3).max(100).trim().optional(),
  address: joi.string().min(5).max(255).trim().optional(),
  phone: joi.string().min(7).max(20).trim().optional(),
  email: joi.string().email().trim().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export default updateCompanyValidatorSchema;
