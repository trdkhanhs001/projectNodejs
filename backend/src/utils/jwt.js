const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_EXPIRATION = process.env.JWT_EXPIRE || '7d';

/**
 * Generate JWT token
 * @param {object} payload - Token payload
 * @returns {string} - JWT token
 */
const generateToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION
    });
  } catch (error) {
    throw new Error('Error generating token: ' + error.message);
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} - Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token: ' + error.message);
  }
};

module.exports = {
  generateToken,
  verifyToken
};
