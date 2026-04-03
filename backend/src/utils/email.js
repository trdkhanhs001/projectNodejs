const nodemailer = require('nodemailer');

/**
 * Email configuration - Using Gmail SMTP
 * Require environment variables:
 * - EMAIL_USER: Gmail address
 * - EMAIL_PASS: Gmail app password (not regular password)
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

/**
 * Verify email configuration
 */
const verifyEmailConfig = async () => {
  try {
    const verified = await transporter.verify();
    if (verified) {
      console.log('✅ Email service is ready');
      return true;
    }
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    return false;
  }
};

/**
 * Send OTP email
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} purpose - 'signup' | 'forgot_password' | 'verify_email'
 */
const sendOTP = async (email, otp, purpose = 'signup') => {
  try {
    // Email templates based on purpose
    let subject, text, html;

    if (purpose === 'signup') {
      subject = '🔐 Verify Your Email - NHA HANG';
      text = `Your OTP code is: ${otp}. Valid for 10 minutes.`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #667eea;">Xác Thực Email - NHA HANG</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại NHA HANG!</p>
          <p>Mã OTP của bạn là:</p>
          <div style="background-color: #f0f2f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #667eea; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="color: #999;">Mã này có hiệu lực trong 10 phút.</p>
          <p style="color: #999; font-size: 12px;">Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.</p>
        </div>
      `;
    } else if (purpose === 'forgot_password') {
      subject = '🔑 Reset Password - NHA HANG';
      text = `Your password reset OTP code is: ${otp}. Valid for 10 minutes.`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #e74c3c;">Đặt Lại Mật Khẩu - NHA HANG</h2>
          <p>Yêu cầu đặt lại mật khẩu đã được nhận.</p>
          <p>Mã OTP của bạn là:</p>
          <div style="background-color: #f0f2f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #e74c3c; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="color: #999;">Mã này có hiệu lực trong 10 phút.</p>
        </div>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
    return result;
  } catch (error) {
    console.error('❌ Failed to send OTP:', error.message);
    throw error;
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (email, fullName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🎉 Chào Mừng Đến NHA HANG',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #27ae60;">Chào Mừng, ${fullName}! 🎉</h2>
          <p>Tài khoản của bạn đã được xác thực thành công.</p>
          <p>Bây giờ bạn có thể:</p>
          <ul style="line-height: 2;">
            <li>✨ Khám phá menu đặc biệt</li>
            <li>🛒 Đặt hàng ngay</li>
            <li>💳 Thanh toán dễ dàng</li>
            <li>📱 Theo dõi đơn hàng</li>
          </ul>
          <p><a href="http://localhost:5173" style="background-color: #27ae60; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Bắt Đầu Ngay</a></p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error.message);
  }
};

module.exports = {
  verifyEmailConfig,
  sendOTP,
  sendWelcomeEmail
};
