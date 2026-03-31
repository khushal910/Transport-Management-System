/**
 * Environment configuration for password validation
 * 
 * Usage:
 * - Development: 3-digit passwords allowed
 * - Production: 6+ character passwords required
 */

const ENV = import.meta.env.VITE_ENV || 'development';

const passwordConfig = {
  isDevelopment: ENV === 'development',
  isProduction: ENV === 'production',
  environment: ENV,
  
  // Get minimum password length based on environment
  getMinPasswordLength: () => {
    return ENV === 'development' ? 3 : 6;
  },

  // Get password validation rule message
  getPasswordRuleMessage: () => {
    if (ENV === 'development') {
      return 'Password must be at least 3 characters (Development Mode)';
    }
    return 'Password must be at least 6 characters';
  },

  // Validate password
  validatePassword: (password) => {
    const minLength = passwordConfig.getMinPasswordLength();
    if (!password) {
      return { valid: false, message: 'Password is required' };
    }
    if (password.length < minLength) {
      return { valid: false, message: passwordConfig.getPasswordRuleMessage() };
    }
    return { valid: true, message: '' };
  },

  // Get environment indicator badge
  getEnvironmentBadge: () => {
    if (ENV === 'development') {
      return { label: 'DEV', color: 'bg-orange-100 text-orange-800' };
    }
    return { label: 'PROD', color: 'bg-gray-100 text-gray-800' };
  },
};

export default passwordConfig;
