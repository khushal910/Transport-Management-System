type NodeEnv = 'development' | 'test' | 'production';

const stripWrappingQuotes = (value: string): string => {
  const trimmed = value.trim();
  return trimmed.replace(/^['"]|['"]$/g, '').trim();
};

export const normalizeEnvValue = (value?: string): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = stripWrappingQuotes(value);
  return normalized.length > 0 ? normalized : undefined;
};

const parsePositiveNumber = (value: string | undefined, fallback: number): number => {
  const normalized = normalizeEnvValue(value);
  if (!normalized) {
    return fallback;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
};

const parseNodeEnv = (value: string | undefined): NodeEnv => {
  const lifecycleEvent = normalizeEnvValue(process.env.npm_lifecycle_event)?.toLowerCase();
  if (lifecycleEvent === 'dev') {
    return 'development';
  }

  const normalized = normalizeEnvValue(value)?.toLowerCase();
  if (normalized === 'production') {
    return 'production';
  }
  if (normalized === 'test') {
    return 'test';
  }
  return 'development';
};

/**
 * Parse CORS origins from environment variable
 * In development mode, also allow all localhost/local network addresses on port 5173 for Vite
 */
const parseOrigins = (value: string | undefined, fallbackOrigin: string, isDev: boolean): (string | RegExp)[] => {
  const normalized = normalizeEnvValue(value) ?? fallbackOrigin;
  const origins: (string | RegExp)[] = Array.from(
    new Set(
      normalized
        .split(',')
        .map((origin) => stripWrappingQuotes(origin))
        .filter((origin) => origin.length > 0),
    ),
  );

  // In development, allow all localhost/local network variants for Vite dev server
  if (isDev) {
    origins.push(
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      // Local network addresses (common patterns for Windows/WSL/Docker)
      /^http:\/\/(?:127\.0\.0\.|192\.168\.|10\.|172\.(?:1[6-9]|2[0-9]|3[01])\.).*:5173$/,
    );
  }

  return origins;
};

const nodeEnv = parseNodeEnv(process.env.NODE_ENV);
const isProduction = nodeEnv === 'production';
const isDevelopment = nodeEnv === 'development';
const clientUrl = normalizeEnvValue(process.env.CLIENT_URL) ?? 'http://localhost:5173';

/**
 * Email service does NOT normalize password to preserve spaces in Gmail App-Specific Passwords
 * App-Specific Passwords have format: xxxx xxxx xxxx xxxx (spaces are intentional)
 */
const parseEmailPassword = (value: string | undefined): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  // Only strip surrounding quotes, preserve internal spaces
  const trimmed = value.trim();
  return trimmed.replace(/^['"]|['"]$/g, '').length > 0 ? trimmed.replace(/^['"]|['"]$/g, '') : undefined;
};

export const runtimeConfig = {
  nodeEnv,
  isProduction,
  port: parsePositiveNumber(process.env.PORT, 3000),
  mongoUri: normalizeEnvValue(process.env.MONGO_URI),
  secretKey: normalizeEnvValue(process.env.SECRET_KEY),
  clientUrl,
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS, clientUrl, isDevelopment),
  geocodingBaseUrl: normalizeEnvValue(process.env.GEOCODING_BASE_URL) ?? 'https://nominatim.openstreetmap.org',
  geocodingUserAgent: normalizeEnvValue(process.env.GEOCODING_USER_AGENT) ?? 'transport-management-system/1.0',
  geocodingContactEmail: normalizeEnvValue(process.env.GEOCODING_CONTACT_EMAIL),
  geocodingCountryCodes: normalizeEnvValue(process.env.GEOCODING_COUNTRY_CODES),
  geocodingTimeoutMs: parsePositiveNumber(process.env.GEOCODING_TIMEOUT_MS, 8000),
  rateLimitWindowMs: parsePositiveNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  rateLimitMax: parsePositiveNumber(process.env.RATE_LIMIT_MAX, 200),
  maxFailedLoginAttempts: parsePositiveNumber(process.env.AUTH_MAX_FAILED_LOGIN_ATTEMPTS, 5),
  loginLockMinutes: parsePositiveNumber(process.env.AUTH_LOCKOUT_MINUTES, 15),
  sessionDurationHours: parsePositiveNumber(process.env.SESSION_DURATION_HOURS, 12),
  passwordResetExpiryHours: parsePositiveNumber(process.env.PASSWORD_RESET_EXPIRY, 24),
  // Email configuration (must be manually set in deployment environment)
  emailService: normalizeEnvValue(process.env.EMAIL_SERVICE) ?? 'gmail',
  emailUser: normalizeEnvValue(process.env.EMAIL_USER),
  emailPassword: parseEmailPassword(process.env.EMAIL_PASSWORD),
};

export default runtimeConfig;
