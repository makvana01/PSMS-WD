const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// Load settings
const provider = process.env.EMAIL_PROVIDER || 'resend';
const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const emailFromName = process.env.EMAIL_FROM_NAME || 'Placement System';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

let resendInstance = null;
if (provider === 'resend' && resendApiKey) {
  try {
    resendInstance = new Resend(resendApiKey);
  } catch (err) {
    console.error('Error instantiating Resend SDK:', err.message || err);
  }
}

/**
 * Sends an email using the configured provider (nodemailer or resend).
 * Fallback to console.log if credentials are not fully configured or sending fails.
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @returns {Promise<{success: boolean, messageId?: string, error?: any}>}
 */
const sendEmail = async ({ to, subject, html }) => {
  console.log(`[Email Service] Attempting to send email to: ${to} | Subject: ${subject}`);
  
  if (provider === 'nodemailer') {
    // If SMTP credentials aren't provided, print to console as fallback for development
    if (!smtpUser || !smtpPass) {
      console.warn('[Email Service Warning] Nodemailer SMTP credentials not configured in .env. Falling back to console logging.');
      console.log(`[Email Fallback HTML Content for ${to}]:\n${html}`);
      return { success: true, message: 'Printed to console (SMTP credentials missing)' };
    }

    try {
      const cleanPass = smtpPass.replace(/\s+/g, '');
      const transporter = nodemailer.createTransport({
        host: smtpHost || 'smtp.gmail.com',
        port: smtpPort || 587,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: cleanPass,
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100
      });

      const fromEmail = emailFrom || smtpUser;
      const mailOptions = {
        from: `"${emailFromName}" <${fromEmail}>`,
        to,
        subject,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] ✅ Real email successfully delivered to ${to} via Gmail SMTP! Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('[Email Service Error] Nodemailer failed to send email:', err.message || err);
      // Even if external network fails, ensure developer can see email in terminal
      console.log(`[Email Fallback Preview for ${to}]:\n${html}`);
      return { success: false, error: err.message || err };
    }
  } else {
    // Default to 'resend'
    if (!resendApiKey) {
      console.warn('[Email Service Warning] Resend API key not configured in .env. Falling back to console logging.');
      console.log(`[Email Fallback HTML Content for ${to}]:\n${html}`);
      return { success: true, message: 'Printed to console (Resend API key missing)' };
    }

    try {
      if (!resendInstance) {
        resendInstance = new Resend(resendApiKey);
      }
      const { data, error } = await resendInstance.emails.send({
        from: `"${emailFromName}" <${emailFrom}>`,
        to,
        subject,
        html,
      });

      if (error) {
        console.error('[Email Service Error] Resend API error:', error);
        return { success: false, error };
      }

      console.log(`[Email Service] Resend successfully sent email to ${to}. Message ID: ${data?.id}`);
      return { success: true, messageId: data?.id };
    } catch (err) {
      console.error('[Email Service Error] Resend SDK error:', err.message || err);
      return { success: false, error: err.message || err };
    }
  }
};

module.exports = { sendEmail };
