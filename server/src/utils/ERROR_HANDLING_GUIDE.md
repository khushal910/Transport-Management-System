/**
 * Error Handling Usage Guide
 * 
 * This guide shows how to use the error handling system throughout the application
 */

// ============================================================================
// 1. IN CONTROLLERS - Wrap with error handling and use typed errors
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middlewares/error.middleware';
import {
  ValidationError,
  DatabaseError,
  AuthenticationError,
  NotFoundError,
  EmailServiceError,
  ExternalServiceError,
  EnvironmentError,
} from '../utils/AppError';
import { errorLogger } from '../utils/errorLogger';

/**
 * Example Controller with Error Handling
 */
export class ExampleController {
  /**
   * Create entity with validation and error handling
   */
  public static create = asyncHandler(async (req: Request, res: Response) => {
    const requestLogger = errorLogger.createRequestLogger(
      req.requestId || '',
      req.path,
      req.method,
      req.userId,
    );

    try {
      // Validate input
      if (!req.body.name) {
        throw new ValidationError('Name is required', { field: 'name' });
      }

      if (req.body.email && !isValidEmail(req.body.email)) {
        throw new ValidationError('Invalid email format', {
          field: 'email',
          value: req.body.email,
        });
      }

      // Your business logic here
      const result = await SomeService.create(req.body);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      // The error will be caught by errorHandler middleware
      throw error;
    }
  });

  /**
   * Get entity with not found error handling
   */
  public static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate ID format
    if (!isValidObjectId(id)) {
      throw new ValidationError('Invalid ID format');
    }

    const entity = await SomeService.findById(id);

    if (!entity) {
      throw new NotFoundError('Entity', { id });
    }

    res.status(200).json({
      success: true,
      data: entity,
    });
  });

  /**
   * Update with authorization and error handling
   */
  public static update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!req.userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const entity = await SomeService.findById(id);

    if (!entity) {
      throw new NotFoundError('Entity');
    }

    // Check authorization
    if (entity.userId !== req.userId) {
      throw new AuthenticationError('Not authorized to update this resource');
    }

    const updated = await SomeService.update(id, req.body);

    res.status(200).json({
      success: true,
      data: updated,
    });
  });
}

// ============================================================================
// 2. IN SERVICES - Use specific error handlers for different scenarios
// ============================================================================

/**
 * Example Service with Error Handling
 */
export class EmailService {
  /**
   * Send email with error handling
   */
  public static async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      // Your email sending logic
      const result = await emailProvider.send({
        to,
        subject,
        html,
      });

      if (!result.success) {
        throw new Error(`Email provider returned error: ${result.error}`);
      }
    } catch (error) {
      const emailError = error instanceof Error ? error : new Error(String(error));
      errorLogger.logEmailError(emailError, to);
      throw new EmailServiceError(emailError.message, {
        to,
        subject,
      });
    }
  }
}

/**
 * Example Database Service
 */
export class DatabaseService {
  public static async queryDatabase(query: string): Promise<any> {
    try {
      const result = await database.execute(query);
      return result;
    } catch (error) {
      const dbError = error instanceof Error ? error : new Error(String(error));
      errorLogger.logDatabaseError(dbError, query);
      throw new DatabaseError(dbError.message, { query });
    }
  }
}

/**
 * Example External API Service
 */
export class GeocodingService {
  public static async getCoordinates(address: string): Promise<any> {
    const timeoutMs = 5000;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(`https://api.geocoding-provider.com/geocode?q=${address}`, {
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        errorLogger.logTimeoutError('Geocoding API', timeoutMs);
        throw new TimeoutError('Geocoding API', timeoutMs, { address });
      }

      const extError = error instanceof Error ? error : new Error(String(error));
      errorLogger.logExternalServiceError('Geocoding API', extError);
      throw new ExternalServiceError('Geocoding API', extError.message, { address });
    }
  }
}

// ============================================================================
// 3. IN STARTUP/CONFIG - Check environment variables
// ============================================================================

/**
 * Initialize services with environment validation
 */
export class ServiceInitializer {
  public static initialize(): void {
    // Check critical environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'EMAIL_PROVIDER_API_KEY',
      'GEOCODING_API_URL',
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new EnvironmentError(envVar);
      }
    }

    console.log('✓ All required environment variables are set');
  }
}

// ============================================================================
// 4. CUSTOM ERROR HANDLING - For specific use cases
// ============================================================================

/**
 * Handle authentication errors specifically
 */
export async function authenticateUser(email: string, password: string) {
  const user = await User.findOne({ email });

  if (!user) {
    errorLogger.logAuthenticationError('User not found', undefined);
    throw new AuthenticationError('Invalid email or password');
  }

  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {
    errorLogger.logAuthenticationError('Invalid password', user._id.toString());
    throw new AuthenticationError('Invalid email or password');
  }

  return user;
}

/**
 * Handle business logic errors
 */
import { BusinessLogicError } from '../utils/AppError';

export async function assignVehicleToTrip(vehicleId: string, tripId: string) {
  const vehicle = await Vehicle.findById(vehicleId);
  const trip = await Trip.findById(tripId);

  if (!vehicle) {
    throw new NotFoundError('Vehicle');
  }

  if (!trip) {
    throw new NotFoundError('Trip');
  }

  if (vehicle.status !== 'available') {
    throw new BusinessLogicError(
      `Vehicle cannot be assigned because it is ${vehicle.status}`,
      {
        vehicleId,
        tripId,
        currentStatus: vehicle.status,
      },
    );
  }

  if (trip.assignedVehicle) {
    throw new ConflictError('Trip already has an assigned vehicle', {
      tripId,
      currentVehicleId: trip.assignedVehicle,
    });
  }

  // Assignment logic
  trip.assignedVehicle = vehicleId;
  vehicle.status = 'in-use';

  await trip.save();
  await vehicle.save();

  return { vehicle, trip };
}

// ============================================================================
// 5. ERROR LOGGING IN MIDDLEWARES
// ============================================================================

/**
 * Custom authentication middleware with error logging
 */
export const authMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    errorLogger.logAuthenticationError('No authentication token provided', undefined, req.requestId);
    throw new AuthenticationError('No authentication token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.userId = decoded.id;
    next();
  } catch (error) {
    const jwtError = error instanceof Error ? error : new Error(String(error));
    errorLogger.logAuthenticationError(`Invalid token: ${jwtError.message}`, undefined, req.requestId);
    throw new AuthenticationError('Invalid or expired token');
  }
});

// ============================================================================
// 6. ERROR RESPONSE EXAMPLES
// ============================================================================

/**
 * Examples of error responses clients will receive
 */

// Validation Error Response (400)
// {
//   "success": false,
//   "message": "Name is required",
//   "errorType": "VALIDATION_ERROR",
//   "requestId": "1234567890-abc123",
//   "timestamp": "2024-01-15T10:30:00.000Z"
// }

// Authentication Error Response (401)
// {
//   "success": false,
//   "message": "Invalid email or password",
//   "errorType": "AUTHENTICATION_ERROR",
//   "requestId": "1234567890-abc123",
//   "timestamp": "2024-01-15T10:30:00.000Z"
// }

// Not Found Error Response (404)
// {
//   "success": false,
//   "message": "Entity not found",
//   "errorType": "NOT_FOUND_ERROR",
//   "requestId": "1234567890-abc123",
//   "timestamp": "2024-01-15T10:30:00.000Z"
// }

// Database Error Response (503)
// {
//   "success": false,
//   "message": "Database error: Connection timeout",
//   "errorType": "DATABASE_ERROR",
//   "requestId": "1234567890-abc123",
//   "timestamp": "2024-01-15T10:30:00.000Z"
// }

// Email Service Error Response (503)
// {
//   "success": false,
//   "message": "Email service error: SMTP connection failed",
//   "errorType": "EMAIL_SERVICE_ERROR",
//   "requestId": "1234567890-abc123",
//   "timestamp": "2024-01-15T10:30:00.000Z"
// }

// Production Internal Error Response (500 - sanitized)
// {
//   "success": false,
//   "message": "An error occurred. Please try again later.",
//   "requestId": "1234567890-abc123",
//   "timestamp": "2024-01-15T10:30:00.000Z"
// }
