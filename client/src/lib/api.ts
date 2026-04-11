import type { ApiResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const buildUrl = (path: string) => {
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  return `${API_BASE_URL}${path}`;
};

export const fetchBackend = async <T>(path: string, options: RequestInit = {}) => {
  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(payload?.message || response.statusText || 'Request failed');
  }

  return payload;
};
