import { fetchBackend } from '@/lib/api';
import type { UserRole } from '@/types/fleet';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  company: Record<string, any>;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'manager';
  company: {
    name: string;
    registrationNumber: string;
    address: string;
    phone: string;
    email: string;
  };
}

export type EmployeeRole = Exclude<UserRole, 'manager'>;

export interface EmployeeRecord {
  _id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  company: string;
  isDeleted?: boolean;
  status?: 'available' | 'on_trip' | 'off_duty' | 'suspended';
  driverId?: string;
}

export interface AddEmployeePayload {
  name: string;
  email: string;
  role: EmployeeRole;
  licenseNumber?: string;
  licenseExpiry?: string;
  licenseCategory?: 'truck' | 'van' | 'bike';
}

export interface AddEmployeeResult {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  companyId: string;
  defaultPassword?: string;
  emailSent?: boolean;
  isUserRecovered?: boolean;
  recoveredUser?: {
    id: string;
    name: string;
    email: string;
    role: EmployeeRole;
  };
}

export interface DeletedEmployeesResult {
  deletedEmployees: EmployeeRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface SendEmployeeEmailPayload {
  recipientUserId: string;
  subject: string;
  message: string;
}

export async function login(payload: LoginPayload) {
  return fetchBackend<AuthUser>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterPayload) {
  return fetchBackend<AuthUser>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getEmployees() {
  return fetchBackend<{ employees: EmployeeRecord[] }>('/api/auth/employees');
}

export async function getDeletedEmployees(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.limit) queryParams.set('limit', String(params.limit));
  if (params?.search) queryParams.set('search', params.search);

  const queryString = queryParams.toString();
  const path = queryString ? `/api/auth/employees/deleted?${queryString}` : '/api/auth/employees/deleted';

  return fetchBackend<DeletedEmployeesResult>(path);
}

export async function addEmployee(payload: AddEmployeePayload) {
  return fetchBackend<AddEmployeeResult>('/api/auth/add-employee', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteEmployee(employeeId: string) {
  return fetchBackend<null>(`/api/auth/employee/${employeeId}`, {
    method: 'DELETE',
  });
}

export async function recoverEmployee(employeeId: string) {
  return fetchBackend<EmployeeRecord>(`/api/auth/employee/recover/${employeeId}`, {
    method: 'POST',
  });
}

export async function sendEmployeeEmail(payload: SendEmployeeEmailPayload) {
  return fetchBackend<null>('/api/auth/send-email', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
