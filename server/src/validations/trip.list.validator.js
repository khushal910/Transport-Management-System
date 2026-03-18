import Joi from "joi";

const tripListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().trim().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  minRevenue: Joi.number().min(0).optional(),
  maxRevenue: Joi.number().min(0).optional(),
  minWeight: Joi.number().min(0).optional(),
  maxWeight: Joi.number().min(0).optional(),
  startLocation: Joi.string().trim().max(100).optional(),
  endLocation: Joi.string().trim().max(100).optional(),
  sort: Joi.string()
    .pattern(/^(createdAt|revenue|cargoWeight|status):(asc|desc)$/)
    .optional()
    .default("createdAt:desc"),
  groupBy: Joi.string().valid("status", "driver", "vehicle").optional(),
}).options({ abortEarly: false, stripUnknown: true });

export default tripListQuerySchema;
