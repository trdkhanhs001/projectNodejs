const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_EXPIRATION = process.env.JWT_EXPIRE || '15m'; // Access token: 15 minutes
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRE || '7d'; // Refresh token: 7 days

const generateToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION
    });
  } catch (error) {
    throw new Error('Error generating token: ' + error.message);
  }
};

const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRATION
    });
  } catch (error) {
    throw new Error('Error generating refresh token: ' + error.message);
  }
};

const generateTokenPair = (payload) => {
  return {
    accessToken: generateToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token: ' + error.message);
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token: ' + error.message);
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  generateTokenPair,
  verifyToken,
  verifyRefreshToken
};
