/**
 * HTML Email Templates for OTP Dispatch
 */

/**
 * Generate a premium HTML email template for Student OTP verification
 * @param {string} name - Student's name
 * @param {string} otp - 6-digit OTP code
 * @returns {string} HTML content
 */
const getStudentOtpTemplate = (name, otp) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your PlacementHub Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          <!-- Header (Indigo Gradient) -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 40px 20px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">PlacementHub</h1>
              <p style="margin: 5px 0 0 0; color: #e0e7ff; font-size: 14px;">Elevate Your Career Journey</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px; color: #1f2937;">
              <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 22px; font-weight: 600;">Welcome, ${name}!</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
                Thank you for registering as a **Student** on PlacementHub. To complete your account registration and verify your email, please use the 6-digit Verification Code (OTP) below:
              </p>
              
              <!-- OTP Container -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center" style="background-color: #f0f2ff; border: 1px dashed #4f46e5; border-radius: 12px; padding: 20px 10px;">
                    <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; font-family: monospace; line-height: 1.2;">
                      ${otp}
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5; color: #6b7280; text-align: center;">
                This code is valid for <strong>10 minutes</strong>. Please do not share this OTP with anyone.
              </p>
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #4b5563;">
                If you did not initiate this request, you can safely ignore this email. Your email address might have been entered by mistake.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0 0 8px 0;">&copy; 2026 PlacementHub. All rights reserved.</p>
              <p style="margin: 0;">Smart Campus Placement Management System</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Generate a premium HTML email template for Company OTP verification
 * @param {string} companyName - Company/Employer name
 * @param {string} otp - 6-digit OTP code
 * @returns {string} HTML content
 */
const getCompanyOtpTemplate = (companyName, otp) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Partner Registration - PlacementHub</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);">
          <!-- Header (Elegant Dark Slate/Teal Accent) -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 20px; border-bottom: 4px solid #0d9488;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">PlacementHub</h1>
              <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 14px; font-weight: 500;">Employer Partnership Portal</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px; color: #334155;">
              <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 22px; font-weight: 600;">Dear Team ${companyName},</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #475569;">
                Thank you for partner registering as an **Employer** on PlacementHub. We are excited to assist you in hiring the best campus talent. To verify your company email address, please use the following security code (OTP):
              </p>
              
              <!-- OTP Container -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center" style="background-color: #f0fdfa; border: 1px dashed #0d9488; border-radius: 12px; padding: 20px 10px;">
                    <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f766e; font-family: monospace; line-height: 1.2;">
                      ${otp}
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5; color: #64748b; text-align: center;">
                This registration code will expire in <strong>10 minutes</strong>. Please keep this code secure.
              </p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #475569;">
                If your company did not register on our portal, please contact our support team or ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 30px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px;">
              <p style="margin: 0 0 8px 0;">&copy; 2026 PlacementHub. All rights reserved.</p>
              <p style="margin: 0;">Corporate Hiring & Placement Portal</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

module.exports = {
  getStudentOtpTemplate,
  getCompanyOtpTemplate
};
