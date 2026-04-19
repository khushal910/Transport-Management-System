import type { CookieOptions } from 'express';
import runtimeConfig from './runtime';

export const authCookieBaseOptions: CookieOptions = {
  httpOnly: true,
  secure: runtimeConfig.isProduction,
  sameSite: runtimeConfig.isProduction ? 'none' : 'lax',
  path: '/',
};

export const buildAuthCookieOptions = (maxAgeMs?: number): CookieOptions => {
  if (!maxAgeMs || maxAgeMs <= 0) {
    return { ...authCookieBaseOptions };
  }

  return {
    ...authCookieBaseOptions,
    maxAge: maxAgeMs,
  };
};

export default buildAuthCookieOptions;
