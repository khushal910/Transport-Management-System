import Joi, { ObjectSchema } from 'joi';

const tripAddressSuggestionsQuerySchema: ObjectSchema = Joi.object({
  query: Joi.string().trim().min(3).max(120).required(),
  limit: Joi.number().integer().min(1).max(8).default(5),
}).options({ abortEarly: false, stripUnknown: true });

export default tripAddressSuggestionsQuerySchema;
