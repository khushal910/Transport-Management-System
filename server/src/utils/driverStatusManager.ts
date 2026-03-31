/**
 * Driver Status Management Utility
 * Provides helper functions for managing driver status transitions and validations
 */
import {
  DRIVER_STATUS,
  VALID_STATUS_TRANSITIONS,
  ASSIGNABLE_STATUSES,
  MANUALLY_CHANGEABLE_STATUSES,
  DriverStatus,
} from '../constants/driverStatus.constants';

type DriverStatusChangeReason =
  | 'manual_update'
  | 'automatic_trip_assign'
  | 'automatic_trip_complete'
  | 'automatic_trip_cancel';

interface DriverStatusChangeRecord {
  fromStatus: DriverStatus;
  toStatus: DriverStatus;
  reason: DriverStatusChangeReason;
  changedBy: string | null;
  changedAt: Date;
}

interface DriverStatusUpdateOptions {
  reason?: DriverStatusChangeReason;
  changedBy?: string | null;
  validateTransition?: boolean;
}

interface DriverLike {
  status: DriverStatus;
}

interface DriverStatusUpdatePayload {
  status: DriverStatus;
  lastStatusChange: Date;
  $push: {
    statusHistory: DriverStatusChangeRecord;
  };
}

/**
 * Check if a driver can be assigned to a trip
 * @param driverStatus - Current driver status
 * @throws Error If driver cannot be assigned
 */
export const validateDriverForAssignment = (driverStatus: DriverStatus): void => {
  if (!ASSIGNABLE_STATUSES.includes(driverStatus)) {
    if (driverStatus === DRIVER_STATUS.ON_TRIP) {
      throw new Error('Driver is currently on a trip and cannot be assigned to another trip');
    }
    if (driverStatus === DRIVER_STATUS.SUSPENDED) {
      throw new Error('Driver is suspended and cannot be assigned to trips');
    }
    if (driverStatus === DRIVER_STATUS.OFF_DUTY) {
      throw new Error('Driver is off duty and cannot be assigned to trips');
    }
    throw new Error(`Driver with status "${driverStatus}" cannot be assigned to trips`);
  }
};

/**
 * Check if a driver status can be manually changed
 * @param currentStatus - Current driver status
 * @throws Error If status is ON_TRIP
 */
export const validateManualStatusChange = (currentStatus: DriverStatus): void => {
  if (currentStatus === DRIVER_STATUS.ON_TRIP) {
    throw new Error('Driver is currently on a trip and cannot be updated manually. Wait for trip completion.');
  }
  if (!MANUALLY_CHANGEABLE_STATUSES.includes(currentStatus)) {
    throw new Error(`Cannot manually change driver status from "${currentStatus}"`);
  }
};

/**
 * Validate status transition
 * @param fromStatus - Current status
 * @param toStatus - Target status
 * @throws Error If transition is invalid
 */
export const validateStatusTransition = (fromStatus: DriverStatus, toStatus: DriverStatus): void => {
  if (fromStatus === toStatus) {
    return;
  }

  if (!VALID_STATUS_TRANSITIONS[fromStatus]?.includes(toStatus)) {
    throw new Error(`Cannot transition driver status from "${fromStatus}" to "${toStatus}"`);
  }
};

/**
 * Get driver status change record for audit log
 * @param fromStatus - Previous status
 * @param toStatus - New status
 * @param reason - Reason for change
 * @param changedBy - User ID who made the change (null for automatic)
 * @returns Status change record
 */
export const createStatusChangeRecord = (
  fromStatus: DriverStatus,
  toStatus: DriverStatus,
  reason: DriverStatusChangeReason,
  changedBy: string | null = null
): DriverStatusChangeRecord => {
  return {
    fromStatus,
    toStatus,
    reason,
    changedBy,
    changedAt: new Date(),
  };
};

/**
 * Update driver status with validation and audit trail
 * @param driver - Driver document from database
 * @param newStatus - Target status
 * @param options - Additional options
 * @returns Updated driver object with audit record
 */
export const prepareDriverStatusUpdate = (
  driver: DriverLike,
  newStatus: DriverStatus,
  options: DriverStatusUpdateOptions = {}
): DriverStatusUpdatePayload => {
  const {
    reason = 'manual_update',
    changedBy = null,
    validateTransition = true,
  } = options;

  validateManualStatusChange(driver.status);

  if (validateTransition) {
    validateStatusTransition(driver.status, newStatus);
  }

  const statusChange = createStatusChangeRecord(driver.status, newStatus, reason, changedBy);

  return {
    status: newStatus,
    lastStatusChange: new Date(),
    $push: {
      statusHistory: statusChange,
    },
  };
};

/**
 * Get allowed status transitions from current status
 * @param currentStatus - Current driver status
 * @returns Array of allowed target statuses
 */
export const getAllowedStatusTransitions = (currentStatus: DriverStatus): string[] => {
  return VALID_STATUS_TRANSITIONS[currentStatus] || [];
};

export default {
  validateDriverForAssignment,
  validateManualStatusChange,
  validateStatusTransition,
  createStatusChangeRecord,
  prepareDriverStatusUpdate,
  getAllowedStatusTransitions,
};
