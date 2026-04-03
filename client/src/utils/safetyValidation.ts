/**
 * Safety Officer Validation Utilities
 * Production-grade validation logic for safety checks
 */

export interface DriverSafetyValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate driver eligibility for trip assignment
 * Checks: license expiry, safety score, suspension status
 */
export const validateDriverEligibility = (driver: {
  licenseExpiry: string;
  safetyScore: number;
  status: string;
  name: string;
}): DriverSafetyValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check license expiry
  const expiryDate = new Date(driver.licenseExpiry);
  const today = new Date();

  if (expiryDate < today) {
    errors.push(`License expired on ${expiryDate.toLocaleDateString()}`);
  } else if (
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) < 30
  ) {
    warnings.push(`License expires in less than 30 days`);
  }

  // Check safety score
  if (driver.safetyScore < 40) {
    errors.push(`Critical safety score: ${driver.safetyScore}%`);
  } else if (driver.safetyScore < 60) {
    warnings.push(`Low safety score: ${driver.safetyScore}%. Consider training.`);
  }

  // Check suspension status
  if (driver.status === 'suspended') {
    errors.push('Driver is currently suspended');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Check if driver can be assigned to trip
 * Returns reason if unable
 */
export const canAssignDriver = (driver: any): { canAssign: boolean; reason?: string } => {
  // Check license expiry
  if (new Date(driver.licenseExpiry) < new Date()) {
    return {
      canAssign: false,
      reason: `Cannot assign: License expired on ${new Date(driver.licenseExpiry).toLocaleDateString()}`,
    };
  }

  // Check suspension
  if (driver.status === 'suspended') {
    return {
      canAssign: false,
      reason: 'Cannot assign: Driver is currently suspended',
    };
  }

  // Check safety score
  if (driver.safetyScore < 40) {
    return {
      canAssign: false,
      reason: 'Cannot assign: Critical safety score below minimum threshold',
    };
  }

  return { canAssign: true };
};

/**
 * Generate safety alert based on driver metrics
 */
export const generateSafetyAlert = (driver: any): string | null => {
  if (new Date(driver.licenseExpiry) < new Date()) {
    return `🔴 CRITICAL: ${driver.name}'s license has expired`;
  }

  if (driver.safetyScore < 40) {
    return `🔴 CRITICAL: ${driver.name} has critical safety score (${driver.safetyScore}%)`;
  }

  if (driver.safetyScore < 60) {
    return `🟡 WARNING: ${driver.name} has low safety score (${driver.safetyScore}%)`;
  }

  if (driver.overSpeedingIncidents > 5) {
    return `🟡 WARNING: ${driver.name} has ${driver.overSpeedingIncidents} over-speeding incidents`;
  }

  if (driver.accidentHistory > 2) {
    return `🟡 WARNING: ${driver.name} has ${driver.accidentHistory} accidents`;
  }

  return null;
};

/**
 * Calculate fleet safety score
 */
export const calculateFleetSafetyScore = (drivers: any[]): number => {
  if (drivers.length === 0) return 0;
  const sum = drivers.reduce((acc, driver) => acc + driver.safetyScore, 0);
  return Math.round(sum / drivers.length);
};

/**
 * Get compliance rate (valid licenses percentage)
 */
export const getComplianceRate = (drivers: any[]): number => {
  if (drivers.length === 0) return 100;
  const validLicenses = drivers.filter(
    (d) => new Date(d.licenseExpiry) >= new Date()
  ).length;
  return Math.round((validLicenses / drivers.length) * 100);
};

/**
 * Categorize drivers by risk level
 */
export const categorizeDreiversByRisk = (
  drivers: any[]
): {
  high: any[];
  medium: any[];
  low: any[];
} => {
  const high: any[] = [];
  const medium: any[] = [];
  const low: any[] = [];

  drivers.forEach((driver) => {
    const validation = validateDriverEligibility(driver);

    if (!validation.isValid || driver.safetyScore < 40) {
      high.push(driver);
    } else if (driver.safetyScore < 70 || validation.warnings.length > 0) {
      medium.push(driver);
    } else {
      low.push(driver);
    }
  });

  return { high, medium, low };
};

export default {
  validateDriverEligibility,
  canAssignDriver,
  generateSafetyAlert,
  calculateFleetSafetyScore,
  getComplianceRate,
  categorizeDreiversByRisk,
};
