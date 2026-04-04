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

/**
 * Escape special regex characters to prevent regex injection
 * @param {string} str - The string to escape
 * @returns {string} The escaped string safe for use in regex
 */
const escapeRegex = (str) => {
  if (!str) return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Validate and sanitize search query
 * @param {string} query - The search query to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string|null} Sanitized query or null if invalid
 */
const sanitizeSearchQuery = (query, maxLength = 100) => {
  if (!query) return null;
  
  // Remove leading/trailing whitespace
  query = query.trim();
  
  // Check length
  if (query.length > maxLength) {
    return null;
  }
  
  // Check for suspicious patterns
  if (/[<>\"'%;()&+]/.test(query)) {
    return null;
  }
  
  return query;
};

/**
 * Build safe search query for MongoDB
 * @param {string} searchTerm - The search term
 * @param {array} fields - Fields to search in
 * @returns {object} MongoDB query object
 */
const buildSafeSearchQuery = (searchTerm, fields = []) => {
  if (!searchTerm || fields.length === 0) return {};
  
  const sanitized = sanitizeSearchQuery(searchTerm);
  if (!sanitized) return {};
  
  const escapedTerm = escapeRegex(sanitized);
  
  return {
    $or: fields.map(field => ({
      [field]: { $regex: escapedTerm, $options: 'i' }
    }))
  };
};

module.exports = {
  validatePasswordStrength,
  isCommonPassword,
  escapeRegex,
  sanitizeSearchQuery,
  buildSafeSearchQuery
};
