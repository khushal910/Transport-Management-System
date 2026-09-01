import joi, { ObjectSchema } from 'joi';

const sendEmailValidatorSchema: ObjectSchema = joi.object({
  recipientUserId: joi.string().trim().allow('', null).optional(),
  employeeId: joi.string().trim().allow('', null).optional(),
  userId: joi.string().trim().allow('', null).optional(),
  recipientEmail: joi.string().email().trim().allow('', null).optional(),
  email: joi.string().email().trim().allow('', null).optional(),
  to: joi.string().trim().allow('', null).optional(),
  subject: joi.string().min(1).max(250).trim().required(),
  message: joi.string().min(1).max(10000).trim().required(),
}).unknown(true);

export default sendEmailValidatorSchema;
