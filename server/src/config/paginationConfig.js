// Centralized pagination configuration from environment variables
const DEFAULT_LIMIT = parseInt(process.env.PAGINATION_DEFAULT_LIMIT) || 10;
const MAX_LIMIT = parseInt(process.env.PAGINATION_MAX_LIMIT) || 100;

export { DEFAULT_LIMIT, MAX_LIMIT };
