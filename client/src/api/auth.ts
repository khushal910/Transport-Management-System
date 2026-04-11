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
