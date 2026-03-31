/**
 * Driver Status Constants
 * Defines the enumerated states that a driver can be in
 */

// TypeScript enums for driver status
export enum DriverStatus {
  AVAILABLE = 'available',
  ON_TRIP = 'on_trip',
  OFF_DUTY = 'off_duty',
  SUSPENDED = 'suspended',
}

// Object-based constants for backward compatibility
export const DRIVER_STATUS: Record<string, string> = {
  AVAILABLE: 'available',      // Driver is on duty and available for assignment
  ON_TRIP: 'on_trip',          // Driver is currently on an active trip
  OFF_DUTY: 'off_duty',        // Driver is off duty
  SUSPENDED: 'suspended',      // Driver is suspended and cannot work
};

/**
 * Valid status transitions
 * Defines which statuses drivers can transition to
 */
export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  [DRIVER_STATUS.AVAILABLE]: [DRIVER_STATUS.OFF_DUTY, DRIVER_STATUS.SUSPENDED],
  [DRIVER_STATUS.OFF_DUTY]: [DRIVER_STATUS.AVAILABLE, DRIVER_STATUS.SUSPENDED],
  [DRIVER_STATUS.ON_TRIP]: [],  // Cannot manually change when on trip
  [DRIVER_STATUS.SUSPENDED]: [DRIVER_STATUS.AVAILABLE, DRIVER_STATUS.OFF_DUTY],
};

/**
 * Statuses that allow trip assignment
 */
export const ASSIGNABLE_STATUSES: string[] = [DRIVER_STATUS.AVAILABLE];

/**
 * Statuses that allow manual status changes
 */
export const MANUALLY_CHANGEABLE_STATUSES: string[] = [
  DRIVER_STATUS.AVAILABLE,
  DRIVER_STATUS.OFF_DUTY,
  DRIVER_STATUS.SUSPENDED,
];

export default DRIVER_STATUS;
