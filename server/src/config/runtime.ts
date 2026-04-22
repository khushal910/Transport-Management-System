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

const parseOrigins = (value: string | undefined, fallbackOrigin: string): string[] => {
  const normalized = normalizeEnvValue(value) ?? fallbackOrigin;
  return Array.from(
    new Set(
      normalized
        .split(',')
        .map((origin) => stripWrappingQuotes(origin))
        .filter((origin) => origin.length > 0),
    ),
  );
};

const nodeEnv = parseNodeEnv(process.env.NODE_ENV);
const isProduction = nodeEnv === 'production';
const clientUrl = normalizeEnvValue(process.env.CLIENT_URL) ?? 'http://localhost:5173';

export const runtimeConfig = {
  nodeEnv,
  isProduction,
  port: parsePositiveNumber(process.env.PORT, 3000),
  mongoUri: normalizeEnvValue(process.env.MONGO_URI),
  secretKey: normalizeEnvValue(process.env.SECRET_KEY),
  clientUrl,
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS, clientUrl),
  rateLimitWindowMs: parsePositiveNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  rateLimitMax: parsePositiveNumber(process.env.RATE_LIMIT_MAX, 200),
  sessionDurationHours: parsePositiveNumber(process.env.SESSION_DURATION_HOURS, 12),
  passwordResetExpiryHours: parsePositiveNumber(process.env.PASSWORD_RESET_EXPIRY, 24),
};

export default runtimeConfig;
