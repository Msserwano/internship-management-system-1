// backend/src/config/mailer.js
const nodemailer = require("nodemailer");

const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  // Support either EMAIL_PASS (older) or EMAIL_PASSWORD (common)
  const pass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

  // Basic sanity checks: if missing credentials or placeholder address, fall back to console mode
  if (!user || !pass || (typeof user === "string" && /your-?email/i.test(user))) {
    console.warn('[MAILER] SMTP not configured: please set EMAIL_USER and EMAIL_PASSWORD (or EMAIL_PASS) in .env');
    return null; // Signals fallback to console mode
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: String(process.env.SMTP_PORT) === "465", // true for 465, false for 587
    auth: {
      user: user,
      pass: pass,
    },
  });
};

/**
 * Sends a 6-digit email verification code to the recipient.
 */
const sendVerificationEmail = async (toEmail, otpCode, firstName = "Applicant") => {
  const transporter = createTransporter();

  // HTML email layout with KCCA styling
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-radius: 12px; background-color: #ffffff;">
      <div style="background-color: #0284c7; padding: 16px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="color: #ffffff; margin: 0; font-size: 20px;">KCCA Internship Portal</h2>
      </div>
      <div style="padding: 24px; color: #334155;">
        <h3 style="margin-top: 0;">Hello ${firstName},</h3>
        <p style="font-size: 15px; line-height: 1.5;">
          Thank you for registering with the Kampala Capital City Authority Internship Management System.
        </p>
        <p style="font-size: 15px; line-height: 1.5;">
          Your 6-digit email verification code is:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0284c7; background: #f0f9ff; padding: 12px 24px; border-radius: 8px; border: 1px dashed #0284c7;">
            ${otpCode}
          </span>
        </div>
        <p style="font-size: 14px; color: #64748b;">
          This code will expire in <strong>15 minutes</strong>. If you did not request this code, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          Kampala Capital City Authority &bull; Internship Management System
        </p>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`\n==================================================`);
    console.log(`[MAILER SIMULATION MODE] No SMTP credentials configured.`);
    console.log(`To: ${toEmail}`);
    console.log(`Subject: KCCA Internship Verification Code`);
    console.log(`Verification Code (OTP): >>> ${otpCode} <<<`);
    console.log(`==================================================\n`);
    return { success: true, mode: "console", code: otpCode };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `KCCA Internship Portal <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `${otpCode} is your KCCA Internship Verification Code`,
      html: htmlContent,
    });
    console.log(`[MAILER] Verification email sent to ${toEmail}. Message ID: ${info.messageId}`);
    return { success: true, mode: "smtp", messageId: info.messageId };
  } catch (error) {
    console.error(`[MAILER ERROR] Failed to send email via SMTP to ${toEmail}:`, error.message);
    console.log(`[MAILER FALLBACK] Verification Code for ${toEmail}: >>> ${otpCode} <<<`);
    return { success: false, error: error.message, mode: "fallback", code: otpCode };
  }
};

module.exports = {
  sendVerificationEmail,
  /**
   * Send a generic notification email (used for HR notifications)
   */
  sendNotificationEmail: async (toEmail, subject, htmlContent, textContent = '') => {
    const transporter = createTransporter();

    if (!transporter) {
      console.log(`\n[MAILER SIMULATION MODE] Notification`);
      console.log(`To: ${toEmail}`);
      console.log(`Subject: ${subject}`);
      if (textContent) console.log(`Text: ${textContent}`);
      console.log(`HTML: ${htmlContent}\n`);
      return { success: true, mode: 'console' };
    }

    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || `KCCA Internship Portal <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`[MAILER] Notification email sent to ${toEmail}. Message ID: ${info.messageId}`);
      return { success: true, mode: 'smtp', messageId: info.messageId };
    } catch (error) {
      console.error(`[MAILER ERROR] Failed to send notification to ${toEmail}:`, error.message);
      return { success: false, error: error.message, mode: 'fallback' };
    }
  },
};
