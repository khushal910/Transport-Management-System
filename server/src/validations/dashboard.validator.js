import Joi from 'joi';

const dashboardQuerySchema = Joi.object({
  vehicleType: Joi.string()
    .trim()
    .lowercase()
    .valid('truck', 'van', 'bike')
    .optional(),
  status: Joi.string()
    .trim()
    .lowercase()
    .valid('draft', 'dispatched', 'completed', 'cancelled')
    .optional(),
}).options({ abortEarly: false, stripUnknown: true });

export default dashboardQuerySchema;
