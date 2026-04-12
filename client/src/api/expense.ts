import { fetchBackend } from '@/lib/api';

export interface Expense {
  _id: string;
  driverId: string;
  vehicleId: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  receipt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseListPayload {
  expenses: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getExpenseList(page = 1, limit = 50) {
  return fetchBackend<ExpenseListPayload>(`/api/expense/list?page=${page}&limit=${limit}`);
}

export async function createExpense(data: Omit<Expense, '_id' | 'createdAt' | 'updatedAt'>) {
  return fetchBackend(`/api/expense/create`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateExpense(expenseId: string, data: Partial<Expense>) {
  return fetchBackend(`/api/expense/update/${expenseId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
