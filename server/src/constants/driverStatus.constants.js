/**
 * Driver Status Constants
 * Defines the enumerated states that a driver can be in
 */
export const DRIVER_STATUS = {
  AVAILABLE: 'available',      // Driver is on duty and available for assignment
  ON_TRIP: 'on_trip',          // Driver is currently on an active trip
  OFF_DUTY: 'off_duty',        // Driver is off duty
  SUSPENDED: 'suspended',      // Driver is suspended and cannot work
};

/**
 * Valid status transitions
 * Defines which statuses drivers can transition to
 */
export const VALID_STATUS_TRANSITIONS = {
  [DRIVER_STATUS.AVAILABLE]: [DRIVER_STATUS.OFF_DUTY, DRIVER_STATUS.SUSPENDED],
  [DRIVER_STATUS.OFF_DUTY]: [DRIVER_STATUS.AVAILABLE, DRIVER_STATUS.SUSPENDED],
  [DRIVER_STATUS.ON_TRIP]: [],  // Cannot manually change when on trip
  [DRIVER_STATUS.SUSPENDED]: [DRIVER_STATUS.AVAILABLE, DRIVER_STATUS.OFF_DUTY],
};

/**
 * Statuses that allow trip assignment
 */
export const ASSIGNABLE_STATUSES = [DRIVER_STATUS.AVAILABLE];

/**
 * Statuses that allow manual status changes
 */
export const MANUALLY_CHANGEABLE_STATUSES = [
  DRIVER_STATUS.AVAILABLE,
  DRIVER_STATUS.OFF_DUTY,
  DRIVER_STATUS.SUSPENDED,
];

export default DRIVER_STATUS;
