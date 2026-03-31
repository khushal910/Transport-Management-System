import joi, { ObjectSchema } from 'joi';
import { DEFAULT_LIMIT, MAX_LIMIT } from '../config/paginationConfig';

const maintenanceListSchema: ObjectSchema = joi.object({
  page: joi.number().integer().positive().default(1),
  limit: joi.number().integer().positive().default(DEFAULT_LIMIT),
  sort: joi
    .string()
    .pattern(/^(serviceDate|cost|status):(asc|desc)$/)
    .optional()
    .default('serviceDate:desc'),
  groupBy: joi.string().valid('status', 'vehicle').optional(),
  status: joi.string().lowercase().optional(),
  startDate: joi.date().optional(),
  endDate: joi.date().optional(),
  minCost: joi.number().min(0).optional(),
  maxCost: joi.number().min(0).optional(),
  description: joi.string().optional(),
});

export default maintenanceListSchema;
