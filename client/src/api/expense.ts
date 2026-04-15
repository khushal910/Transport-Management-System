import { fetchBackend } from '@/lib/api';

export type ExpenseStatus = 'pending' | 'completed' | 'cancelled';

export interface ExpenseListItem {
  _id: string;
  tripId?: string;
  driverName?: string;
  vehicleName?: string;
  plateNumber?: string;
  model?: string;
  startLocation?: string;
  endLocation?: string;
  fuelCost: number;
  miscExpense: number;
  totalCost?: number;
  distance: number;
  status: ExpenseStatus;
  date: string;
  trip?: {
    _id?: string;
    startLocation?: string;
    endLocation?: string;
    status?: string;
  };
  driver?: {
    user?: {
      name?: string;
    };
  };
  vehicle?: {
    name?: string;
    licensePlate?: string;
  };
}

export interface ExpenseCreatePayload {
  tripId: string;
  fuelCost: number;
  miscExpense?: number;
  distance?: number;
}

export interface ExpenseUpdatePayload {
  fuelCost?: number;
  miscExpense?: number;
  distance?: number;
}

export interface ExpenseListPayload {
  expenses: ExpenseListItem[];
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

export async function createExpense(data: ExpenseCreatePayload) {
  return fetchBackend(`/api/expense/create`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateExpense(expenseId: string, data: ExpenseUpdatePayload) {
  return fetchBackend(`/api/expense/update/${expenseId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
