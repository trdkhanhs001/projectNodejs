/**
 * Password security utilities
 */

/**
 * Validate password strength
 * Rules:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 */
const validatePasswordStrength = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least 1 uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least 1 lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least 1 number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Check for common weak passwords
 */
const isCommonPassword = (password) => {
  const commonPasswords = [
    'password', '123456', '12345678', 'qwerty', 'abc123',
    'password123', 'admin123', 'letmein', 'welcome', '111111'
  ];

  return commonPasswords.some(common => 
    password.toLowerCase().includes(common.toLowerCase())
  );
};

module.exports = {
  validatePasswordStrength,
  isCommonPassword
};
