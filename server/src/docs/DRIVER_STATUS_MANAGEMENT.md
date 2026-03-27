# Driver Status Management System

## Overview

The Driver Status Management System implements strict state control for driver availability and trip assignments. It ensures drivers can only be assigned to trips when in the correct status, and automatically manages status transitions during the trip lifecycle.

## Status Definitions

| Status | Description | Manual Control | Can Accept Trips |
|--------|-------------|-----------------|------------------|
| **AVAILABLE** | Driver is on duty and available for assignment | ✅ Admin can set | ✅ Yes |
| **ON_TRIP** | Driver is currently on an active trip | ❌ Automatic only | ❌ No |
| **OFF_DUTY** | Driver is off duty | ✅ Admin can set | ❌ No |
| **SUSPENDED** | Driver is suspended and cannot work | ✅ Admin can set | ❌ No |

## Status Transition Rules

### Valid Transitions

```
AVAILABLE    → OFF_DUTY, SUSPENDED (manual only)
OFF_DUTY     → AVAILABLE, SUSPENDED (manual only)
ON_TRIP      → No manual changes allowed
SUSPENDED    → AVAILABLE, OFF_DUTY (manual only)
```

### Automatic Transitions

```
Trip Assignment:     AVAILABLE → ON_TRIP (system automatic)
Trip Completion:     ON_TRIP → AVAILABLE (system automatic)
Trip Cancellation:   ON_TRIP → AVAILABLE (system automatic)
```

## Validation Rules

### Manual Status Change
- ✅ Can be changed if current status is: AVAILABLE, OFF_DUTY, SUSPENDED
- ❌ **Cannot change if status is ON_TRIP** - must wait for trip completion

### Trip Assignment
- ✅ Only drivers with status = AVAILABLE can be assigned
- ❌ Drivers in ON_TRIP cannot be assigned additional trips
- ❌ Drivers in SUSPENDED cannot be assigned
- ❌ Drivers in OFF_DUTY cannot be assigned

### Driver Status Validation
```javascript
// Example: Strict validation at assignment
if (driver.status !== DRIVER_STATUS.AVAILABLE) {
  throw new Error('Driver cannot be assigned to trips');
}
```

## Components

### 1. Constants (`src/constants/driverStatus.constants.js`)
Defines the driver status enum and valid transitions:
```javascript
DRIVER_STATUS = {
  AVAILABLE: 'available',
  ON_TRIP: 'on_trip',
  OFF_DUTY: 'off_duty',
  SUSPENDED: 'suspended',
}

VALID_STATUS_TRANSITIONS = {
  available: ['off_duty', 'suspended'],
  off_duty: ['available', 'suspended'],
  on_trip: [],  // Cannot manually change
  suspended: ['available', 'off_duty'],
}
```

### 2. Driver Status Manager (`src/utils/driverStatusManager.js`)
Utility functions for status validation and management:
- `validateDriverForAssignment()` - Check if driver can be assigned
- `validateManualStatusChange()` - Check if status can be manually changed
- `validateStatusTransition()` - Validate specific transition is allowed
- `createStatusChangeRecord()` - Create audit trail entry
- `prepareDriverStatusUpdate()` - Prepare update with audit trail

### 3. Driver Schema (`src/models/driver.schema.js`)
Updated schema with status tracking:
```javascript
{
  status: {
    type: String,
    enum: ['available', 'on_trip', 'off_duty', 'suspended'],
    default: 'off_duty'
  },
  lastStatusChange: Date,
  statusHistory: [{
    fromStatus: String,
    toStatus: String,
    reason: 'manual_update' | 'automatic_trip_assign' | 'automatic_trip_complete' | 'automatic_trip_cancel',
    changedBy: ObjectId | null,  // null for automatic changes
    changedAt: Date
  }]
}
```

### 4. Driver Status Controller (`src/controllers/employee/updateDriverStatus.js`)
Endpoints for managing driver status:
- `updateDriverStatus()` - Admin/manager endpoint to change driver status
- `getDriverStatusHistory()` - Retrieve audit trail of status changes
- `getDriversByStatus()` - Filter drivers by current status

### 5. Updated Trip Controllers
- `create.trip.js` - Validates driver can be assigned, sets status to ON_TRIP with audit trail
- `update.trip.js` - Validates driver transitions when reassigning
- `update.trip.status.js` - Sets driver back to AVAILABLE on completion/cancellation with audit trail

## API Usage

### 1. Update Driver Status (Admin Only)
```http
POST /driver-status/:driverId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "available"  // or "off_duty", "suspended"
}

Response:
{
  "success": true,
  "message": "Driver status updated successfully",
  "data": {
    "driverId": "...",
    "previousStatus": "off_duty",
    "currentStatus": "available",
    "lastStatusChange": "2026-03-27T...",
    "driverName": "John Doe"
  }
}
```

### 2. Get Driver Status History
```http
GET /driver-status/history/:driverId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Driver status history retrieved",
  "data": {
    "driverId": "...",
    "driverName": "John Doe",
    "currentStatus": "available",
    "statusHistory": [
      {
        "fromStatus": "off_duty",
        "toStatus": "available",
        "reason": "manual_update",
        "changedBy": { "userId": "...", "name": "Manager Name", "role": "manager" },
        "changedAt": "2026-03-27T..."
      },
      {
        "fromStatus": "available",
        "toStatus": "on_trip",
        "reason": "automatic_trip_assign",
        "changedBy": "System (Automatic)",
        "changedAt": "2026-03-27T..."
      }
    ]
  }
}
```

### 3. Get Drivers by Status
```http
GET /driver-status?status=available
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Drivers retrieved successfully",
  "data": {
    "total": 5,
    "drivers": [
      {
        "driverId": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "status": "available",
        "lastStatusChange": "2026-03-27T...",
        "safetyScore": 95,
        "completionRate": 98.5
      }
    ]
  }
}
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Driver is suspended and cannot be assigned to trips" | Attempted to assign suspended driver | Change driver status to AVAILABLE first |
| "Driver is currently on a trip" | Attempted to assign driver already on trip | Wait for trip completion |
| "Driver is off duty and cannot be assigned to trips" | Attempted to assign off-duty driver | Change driver status to AVAILABLE first |
| "Driver is currently on a trip and cannot be updated manually" | Attempted to change status of ON_TRIP driver | Wait for trip to complete or cancel |
| "Cannot transition driver status from 'available' to 'on_trip'" | Invalid manual transition attempted | Check valid transitions above |

## Audit Trail

Every status change is recorded in the `statusHistory` array with:
- **Previous Status**: fromStatus
- **New Status**: toStatus
- **Reason**: Why status changed (manual, automatic_trip_assign, etc.)
- **Changed By**: User ID (null for automatic changes)
- **Timestamp**: When change occurred

This allows complete transparency and audit capability for all driver status changes.

## Example Workflow

```
1. Driver registered with status = OFF_DUTY

2. Admin changes status to AVAILABLE
   Action: Manual update
   ON_TRIP → AVAILABLE
   Reason: manual_update
   Changed By: Admin ID

3. Trip created for driver
   Status automatically changes to ON_TRIP
   Reason: automatic_trip_assign

4. Trip marked as completed
   Status automatically changes to AVAILABLE
   Reason: automatic_trip_complete

5. Driver can now be assigned to another trip

6. If trip is cancelled before completion
   Status automatically changes to AVAILABLE
   Reason: automatic_trip_cancel
```

## Integration Points

### Trip Creation (`create.trip.js`)
- Validates driver status is AVAILABLE
- Throws error if validation fails
- Sets driver status to ON_TRIP
- Records status change in audit trail

### Trip Status Update (`update.trip.status.js`)
- On trip completion: Sets driver status to AVAILABLE
- On trip cancellation: Sets driver status to AVAILABLE
- Records reason for automatic status change

### Trip Update (`update.trip.js`)
- If reassigning driver: Validates new driver is AVAILABLE
- Reverts old driver status to AVAILABLE
- Sets new driver status to ON_TRIP
- Records both status changes

## Best Practices

1. **Always check status before assignment**
   ```javascript
   validateDriverForAssignment(driver.status);
   ```

2. **Never manually change ON_TRIP status**
   ```javascript
   if (driver.status === DRIVER_STATUS.ON_TRIP) {
     throw new Error('Cannot manually change status while on trip');
   }
   ```

3. **Maintain audit trail**
   ```javascript
   const statusChange = createStatusChangeRecord(
     fromStatus, 
     toStatus, 
     reason, 
     changedByUserId
   );
   ```

4. **Use status after automatic changes**
   - Check `lastStatusChange` timestamp
   - Use `statusHistory` for full audit trail

## Future Enhancements

- [ ] Status change notifications to drivers
- [ ] Automatic suspension rules (e.g., after X complaints)
- [ ] Status change approval workflow
- [ ] Bulk status operations
- [ ] Status change scheduling
- [ ] Integration with performance metrics for automatic status adjustments
