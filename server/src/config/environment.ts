/**
 * Environment configuration for development/production settings
 * Centralizes all environment-specific logic
 * 
 * Usage in validators:
 * - Development: Optional passwords, relaxed validation
 * - Production: Strict password requirements, full validation
 */

const ENV = process.env.NODE_ENV || 'development';
const IS_DEVELOPMENT = ENV === 'development';
const IS_PRODUCTION = ENV === 'production';

export const environmentConfig = {
  isDevelopment: IS_DEVELOPMENT,
  isProduction: IS_PRODUCTION,
  environment: ENV,

  // Development mode flag (centralized)
  skipPasswordValidation: IS_DEVELOPMENT,

  // Get minimum password length based on environment
  getMinPasswordLength: () => {
    return IS_DEVELOPMENT ? 1 : 6; // In dev: 1+ char, Prod: 6+ chars
  },

  // Get password validation rule message
  getPasswordRuleMessage: () => {
    if (IS_DEVELOPMENT) {
      return 'Password can be any length (Development Mode - relaxed validation)';
    }
    return 'Password must be at least 6 characters with uppercase, lowercase, number, and special character';
  },

  // Get default password for development mode
  getDefaultPassword: () => {
    return IS_DEVELOPMENT ? 'Dev@123' : null;
  },

  // Validate password - returns validation rules for Joi
  getPasswordValidationRules: () => {
    if (IS_DEVELOPMENT) {
      // In development: password is optional and can be anything
      return {
        password: 'optional', // null means optional in Joi
        requireComplexity: false,
      };
    }
    // In production: strict requirements
    return {
      password: 'required',
      requireComplexity: true,
    };
  },
};

export default environmentConfig;
