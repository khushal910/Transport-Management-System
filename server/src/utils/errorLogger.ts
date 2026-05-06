import runtimeConfig from '../config/runtime';
import { AppError, ErrorType } from './AppError';

/**
 * Error Log Entry Structure
 */
export interface ErrorLogEntry {
  timestamp: string;
  level: 'error' | 'warning' | 'critical';
  errorType: ErrorType;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  userId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
}

/**
 * Production Logger Service
 * Handles centralized error logging for production environments
 */
class ErrorLoggerService {
  /**
   * Format error log entry as JSON
   */
  private formatLogEntry(entry: ErrorLogEntry): string {
    return JSON.stringify(entry);
  }

  /**
   * Determine log level based on error type and status code
   */
  private getLogLevel(
    errorType: ErrorType,
    statusCode?: number,
  ): 'error' | 'warning' | 'critical' {
    // Critical errors
    if (
      [
        ErrorType.DATABASE_ERROR,
        ErrorType.EMAIL_SERVICE_ERROR,
        ErrorType.ENVIRONMENT_ERROR,
        ErrorType.EXTERNAL_SERVICE_ERROR,
      ].includes(errorType)
    ) {
      return 'critical';
    }

    // Warnings for client errors
    if (statusCode && statusCode >= 400 && statusCode < 500) {
      return 'warning';
    }

    // Server errors
    return 'error';
  }

  /**
   * Log an error with full context
   */
  public logError(
    error: Error | AppError,
    context?: {
      userId?: string;
      requestId?: string;
      endpoint?: string;
      method?: string;
      body?: unknown;
      query?: Record<string, unknown>;
      headers?: Record<string, string>;
    },
  ): void {
    const isAppError = error instanceof AppError;

    const contextData: Record<string, unknown> = {
      ...(isAppError ? error.context : {}),
    };

    if (context?.body) {
      contextData.body = context.body;
    }
    if (context?.query) {
      contextData.query = context.query;
    }

    const logEntry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level: this.getLogLevel(
        isAppError ? error.errorType : ErrorType.INTERNAL_SERVER_ERROR,
        isAppError ? error.statusCode : 500,
      ),
      errorType: isAppError ? error.errorType : ErrorType.INTERNAL_SERVER_ERROR,
      message: error.message,
      stack: error.stack,
      context: contextData,
      userId: context?.userId,
      requestId: context?.requestId,
      endpoint: context?.endpoint,
      method: context?.method,
      statusCode: isAppError ? error.statusCode : 500,
    };

    this.writeLog(logEntry);

    // Send critical errors to monitoring service (Sentry, DataDog, etc.)
    if (logEntry.level === 'critical' && runtimeConfig.isProduction) {
      this.sendToMonitoringService(logEntry);
    }
  }

  /**
   * Log specific error types
   */
  public logDatabaseError(error: Error, query?: string, requestId?: string): void {
    this.logError(
      new AppError(
        `Database connection/query failed: ${error.message}`,
        503,
        ErrorType.DATABASE_ERROR,
        { query, originalError: error.message },
      ),
      { requestId, endpoint: 'database' },
    );
  }

  public logEmailError(error: Error, recipientEmail?: string, requestId?: string): void {
    this.logError(
      new AppError(
        `Email sending failed: ${error.message}`,
        503,
        ErrorType.EMAIL_SERVICE_ERROR,
        { recipientEmail, originalError: error.message },
      ),
      { requestId, endpoint: 'email-service' },
    );
  }

  public logAuthenticationError(reason: string, userId?: string, requestId?: string): void {
    this.logError(
      new AppError(reason, 401, ErrorType.AUTHENTICATION_ERROR, {
        reason,
      }),
      { userId, requestId, endpoint: 'authentication' },
    );
  }

  public logEnvironmentError(envVar: string): void {
    this.logError(
      new AppError(
        `Required environment variable is missing or invalid: ${envVar}`,
        500,
        ErrorType.ENVIRONMENT_ERROR,
        { missingVariable: envVar },
      ),
    );
  }

  public logExternalServiceError(
    serviceName: string,
    error: Error,
    requestId?: string,
  ): void {
    this.logError(
      new AppError(
        `External service error from ${serviceName}: ${error.message}`,
        503,
        ErrorType.EXTERNAL_SERVICE_ERROR,
        { serviceName, originalError: error.message },
      ),
      { requestId, endpoint: serviceName },
    );
  }

  public logTimeoutError(serviceName: string, timeoutMs: number, requestId?: string): void {
    this.logError(
      new AppError(
        `${serviceName} request timed out after ${timeoutMs}ms`,
        504,
        ErrorType.TIMEOUT_ERROR,
        { serviceName, timeoutMs },
      ),
      { requestId, endpoint: serviceName },
    );
  }

  public logValidationError(message: string, errors?: unknown, requestId?: string): void {
    this.logError(
      new AppError(message, 400, ErrorType.VALIDATION_ERROR, {
        errors,
      }),
      { requestId },
    );
  }

  /**
   * Write log to console and file (in production)
   */
  private writeLog(entry: ErrorLogEntry): void {
    const logString = this.formatLogEntry(entry);

    if (runtimeConfig.isProduction) {
      // In production, only log critical errors to console to avoid noise
      if (entry.level === 'critical') {
        console.error(`[${entry.level.toUpperCase()}]`, logString);
      }
      // Could also write to file or external logging service
      // Example: appendToFile('./logs/errors.log', logString)
    } else {
      // In development, log all errors
      console.error(`[${entry.level.toUpperCase()}]`, logString);
    }
  }

  /**
   * Send critical errors to external monitoring service
   * Integrate with services like Sentry, DataDog, New Relic, etc.
   */
  private sendToMonitoringService(entry: ErrorLogEntry): void {
    // TODO: Implement integration with your monitoring service
    // Example for Sentry:
    // if (process.env.SENTRY_DSN) {
    //   Sentry.captureException(new Error(entry.message), {
    //     extra: entry.context,
    //     tags: {
    //       errorType: entry.errorType,
    //       userId: entry.userId,
    //     },
    //   });
    // }
  }

  /**
   * Create a request-scoped logger
   */
  public createRequestLogger(
    requestId: string,
    endpoint: string,
    method: string,
    userId?: string,
  ) {
    return {
      error: (error: Error | AppError, context?: Record<string, unknown>) => {
        this.logError(error, {
          requestId,
          endpoint,
          method,
          userId,
          ...context,
        });
      },
      database: (error: Error, query?: string) => {
        this.logDatabaseError(error, query, requestId);
      },
      email: (error: Error, recipientEmail?: string) => {
        this.logEmailError(error, recipientEmail, requestId);
      },
      external: (serviceName: string, error: Error) => {
        this.logExternalServiceError(serviceName, error, requestId);
      },
      timeout: (serviceName: string, timeoutMs: number) => {
        this.logTimeoutError(serviceName, timeoutMs, requestId);
      },
    };
  }
}

// Singleton instance
export const errorLogger = new ErrorLoggerService();
