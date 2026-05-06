import { NextFunction, Request, Response } from 'express';
import runtimeConfig from '../config/runtime';
import { AppError, ErrorType } from '../utils/AppError';
import { errorLogger } from '../utils/errorLogger';

/**
 * Interface for custom Express Request with additional properties
 */
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      userId?: string;
      startTime?: number;
    }
  }
}

/**
 * Generate unique request ID for tracking
 */
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Request ID middleware - adds unique ID to each request
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  req.requestId = req.headers['x-request-id'] as string || generateRequestId();
  req.startTime = Date.now();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

/**
 * Enhanced Error Handler Middleware
 * Catches and processes all errors with proper logging
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const isAppError = err instanceof AppError;
  let statusCode = 500;
  let errorType = ErrorType.INTERNAL_SERVER_ERROR;
  let message = 'Internal server error';
  let responseData: Record<string, unknown> = {};

  if (isAppError) {
    statusCode = err.statusCode;
    errorType = err.errorType;
    message = err.message;
    responseData = err.context || {};
  } else {
    // Handle unexpected errors
    if (err.name === 'ValidationError') {
      statusCode = 400;
      errorType = ErrorType.VALIDATION_ERROR;
      message = 'Validation error';
    } else if (err.name === 'UnauthorizedError') {
      statusCode = 401;
      errorType = ErrorType.AUTHENTICATION_ERROR;
      message = 'Unauthorized';
    } else if (err.name === 'MongoError' || err.name === 'MongoServerError') {
      statusCode = 503;
      errorType = ErrorType.DATABASE_ERROR;
      message = 'Database error';
    }
  }

  // Log the error
  errorLogger.logError(err, {
    requestId: req.requestId,
    userId: req.userId,
    endpoint: req.path,
    method: req.method,
    body: !runtimeConfig.isProduction ? req.body : undefined,
    query: req.query as Record<string, unknown>,
    headers: !runtimeConfig.isProduction
      ? Object.fromEntries(
          Object.entries(req.headers)
            .filter(
              ([key, value]) =>
                !['authorization', 'cookie'].includes(key) && typeof value === 'string',
            )
            .map(([key, value]) => [key, value as string]),
        )
      : undefined,
  });

  // Prepare error response
  const errorResponse = {
    success: false,
    message,
    ...(errorType && { errorType }),
    requestId: req.requestId,
    ...(responseData && Object.keys(responseData).length > 0 && !runtimeConfig.isProduction && { data: responseData }),
    timestamp: new Date().toISOString(),
  };

  // Don't expose sensitive details in production
  if (runtimeConfig.isProduction && !isAppError) {
    // Generic error message for unexpected errors
    const prodResponse = {
      success: false,
      message: 'An error occurred. Please try again later.',
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(prodResponse);
    return;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch promise rejections
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error: Error) => {
      next(error);
    });
  };

/**
 * Global Unhandled Error Handlers
 */
export const setupUnhandledErrorHandlers = () => {
  process.on('uncaughtException', (error: Error) => {
    errorLogger.logError(error);
    console.error('UNCAUGHT EXCEPTION:', error);
    if (runtimeConfig.isProduction) {
      // In production, gracefully shutdown
      process.exit(1);
    }
  });

  process.on('unhandledRejection', (reason: any) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    errorLogger.logError(error);
    console.error('UNHANDLED REJECTION:', error);
    if (runtimeConfig.isProduction) {
      // In production, gracefully shutdown
      process.exit(1);
    }
  });
};
