import Joi from "joi";

const driverListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string()
    .valid('on_duty', 'off_duty', 'on_trip', 'suspended')
    .trim()
    .optional(),
  licenseCategory: Joi.string()
    .valid('truck', 'van', 'bike')
    .trim()
    .optional(),
  minSafetyScore: Joi.number().min(0).max(100).optional(),
  maxSafetyScore: Joi.number().min(0).max(100).optional(),
  minCompletionRate: Joi.number().min(0).max(100).optional(),
  maxCompletionRate: Joi.number().min(0).max(100).optional(),
  minComplaints: Joi.number().min(0).optional(),
  maxComplaints: Joi.number().min(0).optional(),
  licenseExpiring: Joi.string().valid('all', 'expired', 'expiring_30', 'valid').optional(),
  search: Joi.string().trim().max(100).optional(),
  sort: Joi.string()
    .pattern(/^(createdAt|name|safetyScore|completionRate|complaints|licenseExpiry):(asc|desc)$/)
    .optional()
    .default("createdAt:desc"),
  groupBy: Joi.string().valid('status', 'licenseCategory', 'licenseStatus').optional(),
}).options({ abortEarly: false, stripUnknown: true });

export default driverListQuerySchema;
