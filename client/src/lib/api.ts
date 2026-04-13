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

  const responseText = await response.text();
  let payload: ApiResponse<T> | null = null;

  if (responseText) {
    try {
      payload = JSON.parse(responseText) as ApiResponse<T>;
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    throw new Error(payload?.message || response.statusText || responseText || 'Request failed');
  }

  return payload ?? { success: true, message: 'No content', data: null };
};
