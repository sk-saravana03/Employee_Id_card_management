import nodemailer from 'nodemailer';
import EmailLog from '../models/EmailLog.model.js';

// Configure Transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    auth: {
      user: process.env.SMTP_USER || 'mock_user',
      pass: process.env.SMTP_PASS || 'mock_pass',
    },
  });
};

/**
 * Enterprise Email Dispatcher with Audit Logging
 */
const sendEmail = async ({ to, subject, html, template = 'GENERAL' }) => {
  const from = process.env.EMAIL_FROM || '"Enterprise Security Portal" <no-reply@enterprise.com>';
  const transporter = createTransporter();

  let emailLog;
  try {
    // Create initial pending log
    emailLog = await EmailLog.create({
      recipient: to,
      subject,
      template,
      status: 'PENDING',
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    emailLog.status = 'SENT';
    await emailLog.save();

    console.log(`[Email Service] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Failure] Failed to send email to ${to}:`, error.message);
    if (emailLog) {
      emailLog.status = 'FAILED';
      emailLog.errorDetails = error.message;
      await emailLog.save();
    }
    // Return graceful status for non-blocking dev environments
    return { success: false, error: error.message };
  }
};

/**
 * Template: Password Reset Request Email
 */
const sendPasswordResetEmail = async (to, resetToken, userName) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-top: 4px solid #2563eb; padding: 32px; border-radius: 4px; }
        .header { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 16px; letter-spacing: -0.5px; }
        .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 12px 24px; text-decoration: none; font-weight: 600; border-radius: 4px; margin-top: 20px; font-size: 14px; }
        .footer { font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        .token-box { background: #f1f5f9; padding: 12px; border-radius: 4px; font-family: monospace; word-break: break-all; margin-top: 12px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">Enterprise System Password Reset Request</div>
        <p>Dear ${userName || 'Employee'},</p>
        <p>A password reset request was initiated for your enterprise account. Click the button below to reset your credentials. This security token will expire in 1 hour.</p>
        <a href="${resetUrl}" class="btn" target="_blank">Reset Security Password</a>
        <p style="margin-top:24px;">Or copy and paste this verification URL into your browser:</p>
        <div class="token-box">${resetUrl}</div>
        <div class="footer">
          If you did not request this password reset, please contact your System Security Administrator immediately.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: 'Enterprise System - Security Password Reset Request',
    html,
    template: 'PASSWORD_RESET',
  });
};

/**
 * Template: Email Verification Account Activation
 */
const sendVerificationEmail = async (to, verificationToken, userName) => {
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-top: 4px solid #059669; padding: 32px; border-radius: 4px; }
        .header { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #059669; color: #ffffff !important; padding: 12px 24px; text-decoration: none; font-weight: 600; border-radius: 4px; margin-top: 20px; font-size: 14px; }
        .footer { font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">Account Email Verification Required</div>
        <p>Welcome, ${userName || 'Employee'},</p>
        <p>Your enterprise ID card portal account has been provisioned. Please confirm your corporate email address to complete enrollment.</p>
        <a href="${verifyUrl}" class="btn" target="_blank">Verify Corporate Email</a>
        <div class="footer">
          Enterprise Security Administration &copy; ${new Date().getFullYear()}
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: 'Enterprise System - Confirm Corporate Email Address',
    html,
    template: 'EMAIL_VERIFICATION',
  });
};

/**
 * Template: ID Card Generated Email Notification
 */
const sendIdCardGeneratedEmail = async (to, userName, cardId) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
      <h2 style="color: #4f46e5;">Enterprise ID Card Generated</h2>
      <p>Dear ${userName},</p>
      <p>Your official Enterprise Employee ID Card (ID: <strong>${cardId}</strong>) has been generated and ready for production.</p>
      <p>You can view your Digital ID Pass on the Employee Portal.</p>
    </div>
  `;
  return sendEmail({ to, subject: `Enterprise System - ID Card Issued (${cardId})`, html, template: 'ID_CARD_GENERATED' });
};

/**
 * Template: Visitor Approved Email Notification
 */
const sendVisitorApprovedEmail = async (to, visitorName, passNumber, hostName, expectedTime) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
      <h2 style="color: #059669;">Visitor Pass Approved</h2>
      <p>Dear ${visitorName},</p>
      <p>Your visit to host <strong>${hostName}</strong> has been <strong>APPROVED</strong>.</p>
      <p>Pass Number: <strong>${passNumber}</strong></p>
      <p>Expected Entry: ${new Date(expectedTime).toLocaleString()}</p>
      <p>Please present your temporary pass QR code at the security gate upon arrival.</p>
    </div>
  `;
  return sendEmail({ to, subject: `Visitor Pass Approved (${passNumber})`, html, template: 'VISITOR_APPROVED' });
};

/**
 * Template: Visitor Rejected Email Notification
 */
const sendVisitorRejectedEmail = async (to, visitorName, passNumber, reason) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
      <h2 style="color: #dc2626;">Visitor Pass Status Update</h2>
      <p>Dear ${visitorName},</p>
      <p>Your requested visit pass (Pass: <strong>${passNumber}</strong>) was not approved.</p>
      <p>Reason: ${reason || 'Security policy restriction'}</p>
    </div>
  `;
  return sendEmail({ to, subject: `Visitor Pass Status Update (${passNumber})`, html, template: 'VISITOR_REJECTED' });
};

/**
 * Template: Print Job Completed Notification
 */
const sendPrintCompletedEmail = async (to, userName, cardId, jobId) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
      <h2 style="color: #2563eb;">ID Card Ready for Pickup</h2>
      <p>Dear ${userName},</p>
      <p>Your physical ID Card (ID: <strong>${cardId}</strong>, Print Job: <strong>${jobId}</strong>) printing process is <strong>COMPLETED</strong>.</p>
      <p>Please collect your physical badge from the HR / Security Desk.</p>
    </div>
  `;
  return sendEmail({ to, subject: `Physical ID Card Ready for Pickup (${cardId})`, html, template: 'PRINT_COMPLETED' });
};

export {
  sendEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendIdCardGeneratedEmail,
  sendVisitorApprovedEmail,
  sendVisitorRejectedEmail,
  sendPrintCompletedEmail,
};
