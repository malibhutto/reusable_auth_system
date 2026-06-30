/**
 * Premium responsive HTML template generator for Verification Email.
 * @param {string} firstName - User's first name
 * @param {string} otpCode - 6-digit OTP code
 * @returns {string} - Complete HTML template
 */
export const getVerificationEmailTemplate = (firstName, otpCode) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f4f5f6;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 580px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e1e4e6;
          }
          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
            padding: 32px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .content {
            padding: 40px;
            color: #334155;
            line-height: 1.6;
          }
          .content h2 {
            font-size: 20px;
            margin-top: 0;
            color: #1e293b;
            font-weight: 600;
          }
          .otp-container {
            margin: 32px 0;
            text-align: center;
          }
          .otp-code {
            display: inline-block;
            font-family: 'Courier New', Courier, monospace;
            font-size: 36px;
            font-weight: bold;
            color: #4f46e5;
            background-color: #f5f3ff;
            border: 2px dashed #c7d2fe;
            padding: 12px 28px;
            border-radius: 8px;
            letter-spacing: 6px;
          }
          .warning {
            font-size: 13px;
            color: #ef4444;
            background-color: #fef2f2;
            padding: 12px;
            border-radius: 6px;
            border-left: 4px solid #ef4444;
            margin-top: 24px;
          }
          .footer {
            background-color: #f8fafc;
            padding: 24px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Universal Auth System</h1>
          </div>
          <div class="content">
            <h2>Hello, ${firstName}!</h2>
            <p>Thank you for signing up. Please verify your email address to complete your registration. Use the verification code below:</p>
            <div class="otp-container">
              <div class="otp-code">${otpCode}</div>
            </div>
            <div class="warning">
              <strong>Important:</strong> This verification code is valid for exactly <strong>${process.env.OTP_EXPIRES} minutes</strong>. If it expires, you will need to request a new one from the verification screen.
            </div>
            <p style="margin-top: 24px; font-size: 14px; color: #64748b;">If you did not create this account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Universal Auth System. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Premium responsive HTML template generator for Password Recovery.
 * @param {string} firstName - User's first name
 * @param {string} otpCode - 6-digit OTP code
 * @returns {string} - Complete HTML template
 */
export const getForgotPasswordEmailTemplate = (firstName, otpCode) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f4f5f6;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 580px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e1e4e6;
          }
          .header {
            background: linear-gradient(135deg, #db2777 0%, #ec4899 100%);
            padding: 32px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .content {
            padding: 40px;
            color: #334155;
            line-height: 1.6;
          }
          .content h2 {
            font-size: 20px;
            margin-top: 0;
            color: #1e293b;
            font-weight: 600;
          }
          .otp-container {
            margin: 32px 0;
            text-align: center;
          }
          .otp-code {
            display: inline-block;
            font-family: 'Courier New', Courier, monospace;
            font-size: 36px;
            font-weight: bold;
            color: #db2777;
            background-color: #fdf2f8;
            border: 2px dashed #fbcfe8;
            padding: 12px 28px;
            border-radius: 8px;
            letter-spacing: 6px;
          }
          .warning {
            font-size: 13px;
            color: #ef4444;
            background-color: #fef2f2;
            padding: 12px;
            border-radius: 6px;
            border-left: 4px solid #ef4444;
            margin-top: 24px;
          }
          .footer {
            background-color: #f8fafc;
            padding: 24px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Universal Auth System</h1>
          </div>
          <div class="content">
            <h2>Hello, ${firstName}!</h2>
            <p>We received a request to reset your password. Use the verification code below to authorize your password recovery:</p>
            <div class="otp-container">
              <div class="otp-code">${otpCode}</div>
            </div>
            <div class="warning">
              <strong>Important:</strong> This recovery code is valid for exactly <strong>${process.env.OTP_EXPIRES} minutes</strong>. If it expires, you will need to request a new reset code.
            </div>
            <p style="margin-top: 24px; font-size: 14px; color: #64748b;">If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Universal Auth System. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
