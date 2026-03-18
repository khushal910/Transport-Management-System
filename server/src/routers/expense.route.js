import { createExpense } from '../controllers/expense/create.expense.js';
import { getExpenseList } from '../controllers/expense/expense.getList.js';
import requiredRole from '../middlewares/role.middleware.js';
import { Router } from 'express';

const expenseRouter = Router();

// Create expense - validation inside controller
expenseRouter.post(
  '/create',
  requiredRole('manager', 'dispatcher', 'driver'),
  createExpense
);

// Get expense list - validation inside controller
expenseRouter.get(
  '/list',
  requiredRole('manager', 'dispatcher', 'driver'),
  getExpenseList
);

export default expenseRouter;
