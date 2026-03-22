import Joi from 'joi';

// Expense update validator
// Only allows updating fuel cost, misc expense, and distance
// Status is managed automatically by the system
const expenseUpdateSchema = Joi.object({
  fuelCost: Joi.number().min(0).optional(),
  miscExpense: Joi.number().min(0).optional(),
  distance: Joi.number().min(0).optional(),
  // Status is NOT allowed to be manually updated
  // It's automatically set to 'completed' when user fills fuelCost and distance
});

export default expenseUpdateSchema;
