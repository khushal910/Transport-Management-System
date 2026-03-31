import Joi, { ObjectSchema } from 'joi';

export const expenseCreateSchema: ObjectSchema = Joi.object({
  tripId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid Trip ID format',
      'any.required': 'Trip ID is required',
    }),
  fuelCost: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Fuel Cost must be a number',
      'number.min': 'Fuel Cost cannot be negative',
      'any.required': 'Fuel Cost is required',
    }),
  miscExpense: Joi.number()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Misc Expense must be a number',
      'number.min': 'Misc Expense cannot be negative',
    }),
  distance: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Distance must be a number',
      'number.min': 'Distance cannot be negative',
    }),
});
