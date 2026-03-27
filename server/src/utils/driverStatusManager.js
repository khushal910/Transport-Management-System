/**
 * Driver Status Management Utility
 * Provides helper functions for managing driver status transitions and validations
 */
import {
  DRIVER_STATUS,
  VALID_STATUS_TRANSITIONS,
  ASSIGNABLE_STATUSES,
  MANUALLY_CHANGEABLE_STATUSES,
} from '../constants/driverStatus.constants.js';

/**
 * Check if a driver can be assigned to a trip
 * @param {string} driverStatus - Current driver status
 * @throws {Error} If driver cannot be assigned
 */
export const validateDriverForAssignment = (driverStatus) => {
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
 * @param {string} currentStatus - Current driver status
 * @throws {Error} If status is ON_TRIP
 */
export const validateManualStatusChange = (currentStatus) => {
  if (currentStatus === DRIVER_STATUS.ON_TRIP) {
    throw new Error('Driver is currently on a trip and cannot be updated manually. Wait for trip completion.');
  }
  if (!MANUALLY_CHANGEABLE_STATUSES.includes(currentStatus)) {
    throw new Error(`Cannot manually change driver status from "${currentStatus}"`);
  }
};

/**
 * Validate status transition
 * @param {string} fromStatus - Current status
 * @param {string} toStatus - Target status
 * @throws {Error} If transition is invalid
 */
export const validateStatusTransition = (fromStatus, toStatus) => {
  if (fromStatus === toStatus) {
    return; // No transition needed
  }

  if (!VALID_STATUS_TRANSITIONS[fromStatus]?.includes(toStatus)) {
    throw new Error(
      `Cannot transition driver status from "${fromStatus}" to "${toStatus}"`
    );
  }
};

/**
 * Get driver status change record for audit log
 * @param {string} fromStatus - Previous status
 * @param {string} toStatus - New status
 * @param {string} reason - Reason for change (manual, automatic_trip_assign, etc)
 * @param {string} changedBy - User ID who made the change (null for automatic)
 * @returns {Object} Status change record
 */
export const createStatusChangeRecord = (fromStatus, toStatus, reason, changedBy = null) => {
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
 * @param {Object} driver - Driver document from database
 * @param {string} newStatus - Target status
 * @param {Object} options - Additional options
 * @returns {Object} Updated driver object with audit record
 */
export const prepareDriverStatusUpdate = (driver, newStatus, options = {}) => {
  const { reason = 'manual_update', changedBy = null, validateTransition = true } = options;

  // Validate manual status change
  validateManualStatusChange(driver.status);

  // Validate transition if required
  if (validateTransition) {
    validateStatusTransition(driver.status, newStatus);
  }

  // Create audit record
  const statusChange = createStatusChangeRecord(
    driver.status,
    newStatus,
    reason,
    changedBy
  );

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
 * @param {string} currentStatus - Current driver status
 * @returns {Array} Array of allowed target statuses
 */
export const getAllowedStatusTransitions = (currentStatus) => {
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
