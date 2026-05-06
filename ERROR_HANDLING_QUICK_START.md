# Production Error Handling System - Quick Reference

## Files Created/Modified

### New Utility Files
```
server/src/utils/
├── AppError.ts                 # Error class definitions and types
├── errorLogger.ts              # Centralized logging service
├── errorAlert.ts               # Critical error alert service
└── ERROR_HANDLING_GUIDE.md     # Usage examples
```

### New Middleware
```
server/src/middlewares/
└── error.middleware.ts         # Error handler, request ID, async wrapper
```

### Documentation
```
server/
└── PRODUCTION_ERROR_HANDLING.md # Setup, configuration, troubleshooting
```

### Modified Files
```
server/index.ts                 # Integrated error handling middleware
```

## Error Types Available

```typescript
// 4xx Client Errors
ValidationError(400)
AuthenticationError(401)
AuthorizationError(403)
NotFoundError(404)
ConflictError(409)
RateLimitError(429)

// 5xx Server Errors
DatabaseError(503)
EmailServiceError(503)
ExternalServiceError(503)
EnvironmentError(500)
TimeoutError(504)
BusinessLogicError(422)
```

## Quick Integration Steps

1. **In any controller:**
```typescript
import { asyncHandler } from '../middlewares/error.middleware';
import { ValidationError } from '../utils/AppError';

export const myController = asyncHandler(async (req, res) => {
  if (!req.body.email) {
    throw new ValidationError('Email is required');
  }
  // logic...
});
```

2. **In any service:**
```typescript
import { errorLogger } from '../utils/errorLogger';

try {
  await emailService.send(email);
} catch (error) {
  errorLogger.logEmailError(error, email);
  throw new EmailServiceError('Failed to send email');
}
```

3. **Environment variables (optional):**
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/YOUR/WEBHOOK
PAGERDUTY_INTEGRATION_KEY=your_integration_key
SUPPORT_EMAIL=support@company.com
```

## All Error Types & HTTP Codes

| Error Type | HTTP Code | Use Case |
|---|---|---|
| ValidationError | 400 | Invalid input data |
| AuthenticationError | 401 | Login/token failures |
| AuthorizationError | 403 | Permission denied |
| NotFoundError | 404 | Resource not found |
| ConflictError | 409 | Business logic conflicts |
| RateLimitError | 429 | Too many requests |
| DatabaseError | 503 | DB connection/query failed |
| EmailServiceError | 503 | Email sending failed |
| ExternalServiceError | 503 | Third-party API errors |
| EnvironmentError | 500 | Missing env variables |
| TimeoutError | 504 | Request timeout |
| BusinessLogicError | 422 | Invalid business state |

## Features

- ✅ Every error gets a unique request ID
- ✅ Automatic error categorization and logging
- ✅ Development mode shows detailed errors
- ✅ Production mode sanitizes sensitive data
- ✅ Critical errors trigger alerts (Slack/Discord/Email/PagerDuty)
- ✅ Request-scoped logging for complex operations
- ✅ Global uncaught exception handling
- ✅ Full TypeScript support

## Files to Read for Details

1. **Setup & Configuration**: `PRODUCTION_ERROR_HANDLING.md`
2. **Usage Examples**: `ERROR_HANDLING_GUIDE.md`
3. **Error Definitions**: `src/utils/AppError.ts`
4. **Logger Service**: `src/utils/errorLogger.ts`
5. **Error Middleware**: `src/middlewares/error.middleware.ts`
