/**
 * Custom Application Error Class
 * Categorizes errors with proper HTTP status codes and user-friendly messages
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorType: ErrorType;
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    errorType: ErrorType = ErrorType.INTERNAL_SERVER_ERROR,
    context?: Record<string, unknown>,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);

    this.statusCode = statusCode;
    this.errorType = errorType;
    this.isOperational = true;
    this.timestamp = new Date();
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

export enum ErrorType {
  // Client Errors (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',

  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EMAIL_SERVICE_ERROR = 'EMAIL_SERVICE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  ENVIRONMENT_ERROR = 'ENVIRONMENT_ERROR',
  FILE_OPERATION_ERROR = 'FILE_OPERATION_ERROR',

  // Network/Timeout Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // Business Logic Errors
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
}

// HTTP Status Code Mapping
export const errorTypeToStatusCode: Record<ErrorType, number> = {
  [ErrorType.VALIDATION_ERROR]: 400,
  [ErrorType.AUTHENTICATION_ERROR]: 401,
  [ErrorType.AUTHORIZATION_ERROR]: 403,
  [ErrorType.NOT_FOUND_ERROR]: 404,
  [ErrorType.CONFLICT_ERROR]: 409,
  [ErrorType.RATE_LIMIT_ERROR]: 429,
  [ErrorType.INTERNAL_SERVER_ERROR]: 500,
  [ErrorType.DATABASE_ERROR]: 503,
  [ErrorType.EMAIL_SERVICE_ERROR]: 503,
  [ErrorType.EXTERNAL_SERVICE_ERROR]: 503,
  [ErrorType.ENVIRONMENT_ERROR]: 500,
  [ErrorType.FILE_OPERATION_ERROR]: 500,
  [ErrorType.NETWORK_ERROR]: 503,
  [ErrorType.TIMEOUT_ERROR]: 504,
  [ErrorType.BUSINESS_LOGIC_ERROR]: 422,
};

// Specific error creators for common scenarios
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, ErrorType.VALIDATION_ERROR, context);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', context?: Record<string, unknown>) {
    super(message, 401, ErrorType.AUTHENTICATION_ERROR, context);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', context?: Record<string, unknown>) {
    super(message, 403, ErrorType.AUTHORIZATION_ERROR, context);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, context?: Record<string, unknown>) {
    super(`${resource} not found`, 404, ErrorType.NOT_FOUND_ERROR, context);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 409, ErrorType.CONFLICT_ERROR, context);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(`Database error: ${message}`, 503, ErrorType.DATABASE_ERROR, context);
  }
}

export class EmailServiceError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(`Email service error: ${message}`, 503, ErrorType.EMAIL_SERVICE_ERROR, context);
  }
}

export class ExternalServiceError extends AppError {
  constructor(serviceName: string, message: string, context?: Record<string, unknown>) {
    super(`${serviceName} error: ${message}`, 503, ErrorType.EXTERNAL_SERVICE_ERROR, context);
  }
}

export class EnvironmentError extends AppError {
  constructor(envVar: string, context?: Record<string, unknown>) {
    super(`Missing or invalid environment variable: ${envVar}`, 500, ErrorType.ENVIRONMENT_ERROR, context);
  }
}

export class TimeoutError extends AppError {
  constructor(serviceName: string, timeoutMs: number, context?: Record<string, unknown>) {
    super(
      `${serviceName} request timed out after ${timeoutMs}ms`,
      504,
      ErrorType.TIMEOUT_ERROR,
      context,
    );
  }
}

export class BusinessLogicError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 422, ErrorType.BUSINESS_LOGIC_ERROR, context);
  }
}
