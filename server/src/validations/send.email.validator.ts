import joi, { ObjectSchema } from 'joi';

const sendEmailValidatorSchema: ObjectSchema = joi.object({
  recipientUserId: joi.string().hex().length(24).optional(),
  subject: joi.string().min(3).max(120).trim().required(),
  message: joi.string().min(5).max(2000).trim().required(),
});

export default sendEmailValidatorSchema;
