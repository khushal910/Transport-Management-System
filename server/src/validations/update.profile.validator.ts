import joi, { ObjectSchema } from 'joi';

const updateProfileValidatorSchema: ObjectSchema = joi.object({
  name: joi.string().min(3).max(50).trim().optional(),
  email: joi.string().email().trim().optional(),
}).or('name', 'email');

export default updateProfileValidatorSchema;
