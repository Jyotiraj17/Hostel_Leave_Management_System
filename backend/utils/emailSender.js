const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendPasswordResetEmail = async (toEmail, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/auth/reset-password.html?token=${resetToken}`;
  
  const mailOptions = {
    from: `"HMS Hostel Management" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Password Reset Request - HMS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2c3e50; text-align: center;">Hostel Management System (HMS)</h2>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p>Hello,</p>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p style="color: #e74c3c;"><strong>Note:</strong> This reset link is valid for 1 hour only.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="font-size: 12px; color: #7f8c8d; text-align: center;">HMS — Hostel Management System</p>
      </div>
    `
  };

  const transporter = createTransporter();
  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendPasswordResetEmail
};
