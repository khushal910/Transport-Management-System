/**
 * Centralized pagination configuration
 * Uses environment variables with fallback defaults
 */

const DEFAULT_LIMIT: number = parseInt(process.env.PAGINATION_DEFAULT_LIMIT || '10', 10);
const MAX_LIMIT: number = parseInt(process.env.PAGINATION_MAX_LIMIT || '100', 10);

// Validate pagination values
if (DEFAULT_LIMIT <= 0) {
  console.warn('PAGINATION_DEFAULT_LIMIT must be greater than 0, using default: 10');
}

if (MAX_LIMIT <= 0) {
  console.warn('PAGINATION_MAX_LIMIT must be greater than 0, using default: 100');
}

if (DEFAULT_LIMIT > MAX_LIMIT) {
  console.warn('PAGINATION_DEFAULT_LIMIT cannot exceed MAX_LIMIT, adjusting to MAX_LIMIT');
}

export { DEFAULT_LIMIT, MAX_LIMIT };
