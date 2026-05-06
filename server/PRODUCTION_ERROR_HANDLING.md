# Production Error Handling System

This document explains the comprehensive error handling system set up for production environments.

## Overview

The error handling system includes:
- **Centralized Error Types**: Typed errors for different scenarios
- **Logger Service**: Production-grade error logging
- **Error Handler Middleware**: Catches all errors with proper logging
- **Alert Service**: Sends critical error notifications
- **Request Tracking**: Every error is tagged with a unique request ID

## Error Types

All errors inherit from `AppError` and map to appropriate HTTP status codes:

### Client Errors (4xx)
- `ValidationError` (400) - Input validation failures
- `AuthenticationError` (401) - Authentication failures
- `AuthorizationError` (403) - Permission denials
- `NotFoundError` (404) - Resource not found
- `ConflictError` (409) - Business logic conflicts
- `RateLimitError` (429) - Rate limit exceeded

### Server Errors (5xx)
- `DatabaseError` (503) - Database connection/query errors
- `EmailServiceError` (503) - Email sending failures
- `ExternalServiceError` (503) - Third-party API errors
- `EnvironmentError` (500) - Missing/invalid environment variables
- `TimeoutError` (504) - Request timeouts
- `BusinessLogicError` (422) - Business logic violations

## Architecture

### 1. AppError.ts
Defines all error types and status code mappings. Use these instead of throwing generic errors:

```typescript
import { ValidationError, EmailServiceError } from '../utils/AppError';

// ✓ Good
throw new ValidationError('Email is required');
throw new EmailServiceError('SMTP connection failed');

// ✗ Bad
throw new Error('Email is required');
```

### 2. errorLogger.ts
Centralized logging service that:
- Formats errors consistently
- Determines log levels (error, warning, critical)
- Sends critical errors to monitoring services
- Provides request-scoped logging

### 3. error.middleware.ts
Express middleware that:
- Adds unique request ID to each request
- Catches all errors
- Logs with full context (user, endpoint, method, body)
- Returns appropriate HTTP response
- Hides sensitive details in production
- Handles unhandled exceptions/rejections

### 4. errorAlert.ts
Sends critical error notifications via:
- Email (to support team)
- Slack (with formatted webhooks)
- Discord (with embedded messages)
- PagerDuty (for on-call notifications)

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Email alerts (optional)
SUPPORT_EMAIL=support@company.com
EMAIL_FROM=alerts@company.com

# Slack notifications (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Discord notifications (optional)
DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/YOUR/WEBHOOK/URL

# PagerDuty integration (optional)
PAGERDUTY_INTEGRATION_KEY=YOUR_INTEGRATION_KEY

# Monitoring service (optional - for future integration)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
DATADOG_API_KEY=your_datadog_key
```

## Usage in Controllers

```typescript
import { asyncHandler } from '../middlewares/error.middleware';
import { ValidationError, NotFoundError } from '../utils/AppError';

export const createTrip = asyncHandler(async (req: Request, res: Response) => {
  // Validation errors are caught and logged automatically
  if (!req.body.startLocation) {
    throw new ValidationError('Start location is required');
  }

  const vehicle = await Vehicle.findById(req.body.vehicleId);
  if (!vehicle) {
    throw new NotFoundError('Vehicle', { vehicleId: req.body.vehicleId });
  }

  // Your logic here
  const trip = await Trip.create(req.body);

  res.status(201).json({ success: true, data: trip });
  // If any error occurs, errorHandler middleware catches it
});
```

## Usage in Services

```typescript
import { EmailServiceError, DatabaseError } from '../utils/AppError';
import { errorLogger } from '../utils/errorLogger';

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const result = await emailProvider.send({ to, subject, html });
    if (!result.success) {
      throw new Error(result.error);
    }
  } catch (error) {
    errorLogger.logEmailError(error, to);
    throw new EmailServiceError('Failed to send email');
  }
}

export async function queryDatabase(query: string) {
  try {
    return await db.execute(query);
  } catch (error) {
    errorLogger.logDatabaseError(error, query);
    throw new DatabaseError(error.message);
  }
}
```

## Request-Scoped Logging

For complex operations that need detailed logging:

```typescript
const requestLogger = errorLogger.createRequestLogger(
  req.requestId,
  req.path,
  req.method,
  req.userId,
);

try {
  // Your logic
} catch (error) {
  requestLogger.error(error);
  requestLogger.database(error, query);
  requestLogger.email(error, email);
  requestLogger.external('ExternalAPI', error);
  requestLogger.timeout('ExternalAPI', 5000);
}
```

## Production Monitoring

In production, all critical errors are logged and can be monitored via:

1. **Console Output** - Critical errors logged to stdout
2. **Log Files** - Can be sent to centralized logging (ELK, CloudWatch, etc.)
3. **Alert Channels** - Slack, Discord, Email, PagerDuty
4. **Monitoring Services** - Sentry, DataDog, New Relic (configure in errorAlert.ts)

### Example Alert Message

```
🚨 ERROR ALERT 🚨

Error Type: EMAIL_SERVICE_ERROR
Level: CRITICAL
Message: Email sending failed: SMTP connection timeout
Time: 2024-01-15T10:30:00.000Z
Status Code: 503
Request ID: 1705318200000-abc123
User ID: user-456
Endpoint: /api/auth/send-reset-email
Method: POST

Context: {
  "recipientEmail": "user@example.com",
  "originalError": "SMTP timeout"
}
```

## Error Response Examples

### Development Response (with details)
```json
{
  "success": false,
  "message": "Database connection failed: Connection timeout",
  "errorType": "DATABASE_ERROR",
  "requestId": "1705318200000-abc123",
  "data": {
    "query": "SELECT * FROM trips WHERE...",
    "originalError": "Connection timeout"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Production Response (sanitized)
```json
{
  "success": false,
  "message": "An error occurred. Please try again later.",
  "requestId": "1705318200000-abc123",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Best Practices

1. **Always use typed errors** - Don't throw generic `Error` objects
2. **Include context** - Pass relevant data when creating errors
3. **Log at the right level** - Errors are categorized by severity
4. **Use request-scoped loggers** - For better traceability
5. **Handle sensitive data** - Don't include passwords, tokens, etc. in error logs
6. **Test error scenarios** - Test all error paths before deploying
7. **Monitor alerts** - Set up proper monitoring for critical errors

## Common Patterns

### Validation in Route Handler
```typescript
if (!email || !isValidEmail(email)) {
  throw new ValidationError('Invalid email format', { email });
}
```

### Database Operations
```typescript
try {
  const user = await User.findById(id);
} catch (error) {
  errorLogger.logDatabaseError(error, 'User.findById');
  throw new DatabaseError('Failed to fetch user');
}
```

### External API Calls
```typescript
try {
  const response = await fetch(externalUrl, { signal: controller.signal });
} catch (error) {
  if (error.name === 'AbortError') {
    throw new TimeoutError('ExternalAPI', timeoutMs);
  }
  errorLogger.logExternalServiceError('ExternalAPI', error);
  throw new ExternalServiceError('ExternalAPI', error.message);
}
```

### Email Sending
```typescript
try {
  await emailService.send(email, template, data);
} catch (error) {
  errorLogger.logEmailError(error, email);
  throw new EmailServiceError('Failed to send verification email');
}
```

## Testing Error Handling

```typescript
describe('Error Handling', () => {
  it('should throw ValidationError for missing email', () => {
    expect(() => {
      createUser({ name: 'John' }); // missing email
    }).toThrow(ValidationError);
  });

  it('should return 503 for database errors', async () => {
    const response = await request(app)
      .get('/api/trips')
      .expect(503);

    expect(response.body.errorType).toBe('DATABASE_ERROR');
  });

  it('should include request ID in error response', async () => {
    const response = await request(app)
      .get('/api/invalid')
      .expect(404);

    expect(response.body.requestId).toBeDefined();
  });
});
```

## Troubleshooting

### Errors not being logged
- Check if `errorLogger` is being called
- Verify middleware chain includes `errorHandler`
- Check log output in console

### Alerts not being sent
- Verify environment variables are set
- Check webhook URLs are correct
- Test webhook endpoints manually

### Production errors showing details
- Ensure `NODE_ENV=production` is set
- Verify `runtimeConfig.isProduction` is true
- Check that only AppError instances are thrown

## Migration Guide

If you have existing error handling:

1. **Import new error types** in all controllers
2. **Replace generic errors** with typed errors
3. **Add errorLogger calls** for database/external service errors
4. **Test all error paths** before deploying
5. **Configure alert channels** for your team
