const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

/**
 * Validate OTP format
 */
const validateOTP = (otp) => {
  return /^\d{6}$/.test(otp);
};

module.exports = {
  generateOTP,
  validateOTP
};
