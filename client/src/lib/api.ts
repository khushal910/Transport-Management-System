import type { ApiResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/setup-password',
  '/docs',
  '/documentation',
]);

const isPublicPath = (path: string) => {
  if (PUBLIC_PATHS.has(path)) {
    return true;
  }
  return path.startsWith('/docs/') || path.startsWith('/documentation/');
};

const redirectToLoginOnUnauthorized = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const currentPath = window.location.pathname;
  if (isPublicPath(currentPath)) {
    return;
  }

  const currentLocation = `${window.location.pathname}${window.location.search}`;
  const next = encodeURIComponent(currentLocation);
  window.location.replace(`/login?next=${next}`);
};

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
    if (response.status === 401) {
      redirectToLoginOnUnauthorized();
    }
    throw new Error(payload?.message || response.statusText || responseText || 'Request failed');
  }

  return payload ?? { success: true, message: 'No content', data: null };
};
