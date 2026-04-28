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
  lifecycleStatus?: 'pending_setup' | 'active' | 'suspended' | 'inactive';
  user?: {
    lifecycleStatus?: 'pending_setup' | 'active' | 'suspended' | 'inactive';
  };
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

export interface SetupPasswordPayload {
  token: string;
  password: string;
  passwordConfirm: string;
}

export async function setupPassword(payload: SetupPasswordPayload) {
  return fetchBackend<{ message: string }>('/api/auth/setup-password', {
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

// Profile API functions
export interface UserProfile {
  personal: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isPasswordSet: boolean;
    createdAt: string;
    updatedAt: string;
  };
  company: {
    id: string;
    name: string;
    registrationNumber: string;
    address: string;
    phone: string;
    email: string;
    status: 'active' | 'inactive';
  } | null;
  driver?: {
    licenseNumber: string;
    licenseExpiry: string;
    licenseCategory: 'truck' | 'van' | 'bike';
    safetyScore: number;
    status: string;
    assignedTrips: number;
    completedTrips: number;
    completionRate: number;
  };
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
}

export interface UpdateCompanyPayload {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export async function getProfile() {
  const response = await fetchBackend<UserProfile>('/api/auth/profile');
  return response.data;
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await fetchBackend<AuthUser>('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function updateCompany(payload: UpdateCompanyPayload) {
  const response = await fetchBackend<any>('/api/auth/company', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function requestEmailVerification(newEmail: string) {
  const response = await fetchBackend<{ message: string }>('/api/auth/request-email-verification', {
    method: 'POST',
    body: JSON.stringify({ newEmail }),
  });
  return response.data;
}

export async function verifyEmailChange(verificationToken: string) {
  const response = await fetchBackend<UserProfile>('/api/auth/verify-email-change', {
    method: 'POST',
    body: JSON.stringify({ verificationToken }),
  });
  return response.data;
}

export interface ForgotPasswordPayload {
  email: string;
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  return fetchBackend<{ message: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface RequestPasswordResetOTPPayload {
  email: string;
}

export async function requestPasswordResetOTP(payload: RequestPasswordResetOTPPayload) {
  return fetchBackend<{ message: string }>('/api/auth/request-password-reset-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface VerifyPasswordResetOTPPayload {
  email: string;
  otp: string;
  password?: string;
  passwordConfirm?: string;
}

export async function verifyPasswordResetOTP(payload: VerifyPasswordResetOTPPayload) {
  return fetchBackend<{ message: string }>('/api/auth/verify-password-reset-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  passwordConfirm: string;
}

export async function resetPassword(payload: ResetPasswordPayload) {
  return fetchBackend<{ message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
