import Joi, { ObjectSchema } from 'joi';
import { DEFAULT_LIMIT, MAX_LIMIT } from '../config/paginationConfig';

export const expenseListSchema: ObjectSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  sort: Joi.string()
    .pattern(/^[a-zA-Z]+:(asc|desc)$/)
    .default('date:desc')
    .messages({
      'string.pattern.base': 'Sort format should be "field:order" (e.g., "date:desc")',
    }),
  groupBy: Joi.string().valid('', 'status', 'vehicle', 'driver').default(''),
  status: Joi.string().valid('pending', 'completed', 'cancelled'),
  startDate: Joi.date(),
  endDate: Joi.date(),
  minCost: Joi.number().min(0),
  maxCost: Joi.number().min(0),
  driverId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const validateExpenseList = async (req: any, res: any, next: any) => {
  try {
    const { error, value } = expenseListSchema.validate(req.query, { abortEarly: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0]?.message || 'Validation failed',
      });
    }
    next();
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Validation error',
      error: err.message,
    });
  }
};
