import transporter from "../config/mail.js";
import {
  getVerificationEmailTemplate,
  getForgotPasswordEmailTemplate,
} from "../emails/templates/emailTemplates.js";

/**
 * Send email verification code.
 * @param {string} email
 * @param {string} firstName
 * @param {string} otp
 */
export const sendVerificationEmail = async (email, firstName, otp) => {
  const expiryMinutes = Number(process.env.OTP_EXPIRES) || 10;
  const html = getVerificationEmailTemplate(firstName, otp, expiryMinutes);
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Universal Auth" <noreply@yourdomain.com>',
    to: email,
    subject: "Verify Your Email Address",
    html,
  };

  try {
    if (
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS ||
      process.env.EMAIL_USER === "placeholder_user"
    ) {
      throw new Error(
        "SMTP credentials not configured in .env. Falling back to local console logging.",
      );
    }
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Verification email sent successfully to ${email}`);
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      // Do not expose OTP codes in production logs — alert operations team instead
      console.error(
        `❌ Failed to send verification email to ${email}: ${error.message}`,
      );
    } else {
      console.log("\n📧 ===============================================");
      console.log(`⚠️ EMAIL SEND FAIL to [${email}]: ${error.message}`);
      console.log(`🔑 DEV VERIFICATION OTP FOR [${firstName}]: ${otp}`);
      console.log("==================================================\n");
    }
  }
};

/**
 * Send password reset recovery code.
 * @param {string} email
 * @param {string} firstName
 * @param {string} otp
 */
export const sendForgotPasswordEmail = async (email, firstName, otp) => {
  const expiryMinutes = Number(process.env.OTP_EXPIRES) || 10;
  const html = getForgotPasswordEmailTemplate(firstName, otp, expiryMinutes);
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Universal Auth" <noreply@yourdomain.com>',
    to: email,
    subject: "Reset Your Password",
    html,
  };

  try {
    if (
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS ||
      process.env.EMAIL_USER === "placeholder_user"
    ) {
      throw new Error(
        "SMTP credentials not configured in .env. Falling back to local console logging.",
      );
    }
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Password recovery email sent successfully to ${email}`);
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      // Do not expose OTP codes in production logs — alert operations team instead
      console.error(
        `❌ Failed to send password recovery email to ${email}: ${error.message}`,
      );
    } else {
      console.log("\n📧 ===============================================");
      console.log(`⚠️ EMAIL SEND FAIL to [${email}]: ${error.message}`);
      console.log(`🔑 DEV PASSWORD RECOVERY OTP FOR [${firstName}]: ${otp}`);
      console.log("==================================================\n");
    }
  }
};
export default { sendVerificationEmail, sendForgotPasswordEmail };
