import Joi, { ObjectSchema } from "joi";

const analyticsQuerySchema: ObjectSchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  metricsType: Joi.string()
    .valid('overview', 'fuel', 'roi', 'utilization', 'financial', 'all')
    .optional()
    .default('all'),
}).options({ abortEarly: false, stripUnknown: true });

export default analyticsQuerySchema;
