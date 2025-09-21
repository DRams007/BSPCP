import nodemailer from 'nodemailer';

// Create reusable transporter object using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    },
    tls: {
      ciphers: 'SSLv3'
    }
  });
};

// Test email configuration
export const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

// Send password reset email to member
export const sendMemberPasswordResetEmail = async (email, fullName, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetLink = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"BSPCP Admin" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'BSPCP - Password Reset Request',
      html: getPasswordResetEmailTemplate(fullName, resetLink)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Member password reset email sent successfully to:', email);
    return result;
  } catch (error) {
    console.error('❌ Failed to send member password reset email:', error.message);
    throw error;
  }
};

// Send member approval email
export const sendMemberApprovalEmail = async (email, fullName, username, setupToken) => {
  try {
    const transporter = createTransporter();
    const setupLink = `${process.env.BASE_URL}/set-password?token=${setupToken}`;

    const mailOptions = {
      from: `"BSPCP Admin" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Welcome to BSPCP - Complete Your Account Setup!',
      html: getMemberApprovalEmailTemplate(fullName, username, setupLink)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Member approval email sent successfully to:', email);
    return result;
  } catch (error) {
    console.error('❌ Failed to send member approval email:', error.message);
    throw error;
  }
};

// Send admin password reset email
export const sendAdminPasswordResetEmail = async (email, fullName, username, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetLink = `${process.env.BASE_URL}/admin/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"BSPCP System" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'BSPCP Admin - Password Reset Required',
      html: getAdminPasswordResetEmailTemplate(fullName, username, resetLink)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Admin password reset email sent successfully to:', email);
    return result;
  } catch (error) {
    console.error('❌ Failed to send admin password reset email:', error.message);
    throw error;
  }
};

// Helper function to get notification recipients
async function getNotificationRecipients() {
  try {
    const pool = (await import('./db.js')).default;
    const client = await pool.connect();

    // Check if notifications are enabled
    const settingsResult = await client.query(
      `SELECT setting_value FROM notification_settings WHERE setting_name = 'notifications_enabled'`
    );

    if (settingsResult.rows.length === 0 || !settingsResult.rows[0].setting_value) {
      client.release();
      return []; // Notifications disabled
    }

    // Get active recipients
    const recipientsResult = await client.query(
      `SELECT email FROM notification_recipients WHERE is_active = true`
    );

    client.release();

    return recipientsResult.rows.map(row => row.email);
  } catch (error) {
    console.error('Error fetching notification recipients:', error);
    return []; // Fail-safe: no recipients
  }
}

/**
 * Send counsellor booking notification email
 * @param {Object} bookingData - Booking details
 * @param {string} counsellorEmail - Counsellor's email address
 * @param {string} counsellorName - Counsellor's full name
 * @returns {Promise<Object>} Email result
 */
export const sendCounsellorBookingNotificationEmail = async (bookingData, counsellorEmail, counsellorName) => {
  try {
    const transporter = createTransporter();
    const bookingDate = new Date(bookingData.booking_date).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const bookingTime = bookingData.booking_time;

    const mailOptions = {
      from: `"BSPCP Booking System" <${process.env.GMAIL_USER}>`,
      to: counsellorEmail,
      subject: `New Client Booking - ${bookingData.client_name} | ${bookingDate}`,
      html: getCounsellorBookingEmailTemplate(bookingData, counsellorName, bookingDate, bookingTime)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Counsellor booking notification email sent successfully to:', counsellorEmail);
    return result;
  } catch (error) {
    console.error('❌ Failed to send counsellor booking notification email:', error.message);
    throw error;
  }
};

// Send application notification email to admin
export const sendApplicationNotificationEmail = async (applicationData, memberId) => {
  try {
    // Get dynamic list of notification recipients
    const recipients = await getNotificationRecipients();

    if (recipients.length === 0) {
      console.log('📧 No notification recipients configured or notifications disabled');
      return { message: 'No recipients configured or notifications disabled' };
    }

    const transporter = createTransporter();
    const applicationUrl = `${process.env.BASE_URL}/admin/applications`;
    const applicationDate = new Date().toLocaleString();

    const mailOptions = {
      from: `"BSPCP System" <${process.env.GMAIL_USER}>`,
      to: recipients,
      subject: `New BSPCP Membership Application - ${applicationData.firstName} ${applicationData.lastName}`,
      html: getApplicationNotificationEmailTemplate(applicationData, memberId, applicationUrl, applicationDate)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`📧 New application notification email sent successfully to ${recipients.length} recipients:`, recipients);
    return result;
  } catch (error) {
    console.error('❌ Failed to send application notification email:', error.message);
    throw error;
  }
};

// Send request more information email to applicant
export const sendApplicantRequestMoreInfoEmail = async (applicantEmail, applicantName, subject, body) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"BSPCP Admin" <${process.env.GMAIL_USER}>`,
      to: applicantEmail,
      subject: subject,
      html: getRequestMoreInfoEmailTemplate(applicantName, body)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Applicant request more info email sent successfully to:', applicantEmail);
    return result;
  } catch (error) {
    console.error('❌ Failed to send applicant request more info email:', error.message);
    throw error;
  }
};

// Email templates
const getPasswordResetEmailTemplate = (fullName, resetLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - BSPCP</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f9620b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #f9620b; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .warning { background: #f8f9fa; border: 1px solid #333; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .link-text { color: #2563eb; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>BSPCP Password Reset</h1>
        <p>Reset your account password securely</p>
      </div>
      <div class="content">
        <h2>Hello ${fullName},</h2>

        <p>We received a request to reset your password for your BSPCP member account. If you didn't make this request, please ignore this email.</p>

        <p>To reset your password, click the button below:</p>

        <a href="${resetLink}" class="button">Reset My Password</a>

        <p><strong>Security Notice:</strong></p>
        <ul>
          <li>This link expires in 1 hour</li>
          <li>You can only use this link once</li>
          <li>Never share this link with anyone</li>
        </ul>

        <div class="warning">
          <strong>Important:</strong> If you're having trouble clicking the button, copy and paste this URL into your browser: <span class="link-text">${resetLink}</span>
        </div>

        <p>If you continue having issues, please contact our support team.</p>

        <p>Best regards,<br>BSPCP Administration Team</p>
      </div>
      <div class="footer">
        <p>This is an automated message from BSPCP. Please do not reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} Botswana Society of Patient Counselling and Psychotherapy</p>
      </div>
    </body>
    </html>
  `;
};

// Request more information email template
const getRequestMoreInfoEmailTemplate = (applicantName, body) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Additional Information Required - BSPCP</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f9620b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .highlight { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .info-box { background: #f0f9ff; border: 1px solid #0284c7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .contact-info { background: #ecfdf5; border: 2px solid #059669; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .email-body { background: #ffffff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 5px; margin: 20px 0; white-space: pre-line; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📋 Additional Information Required</h1>
        <p>${applicantName} - BSPCP Membership Application</p>
      </div>

      <div class="content">
        <h2>Dear ${applicantName},</h2>

        <div class="highlight">
          <h3>🔍 Request for Additional Information</h3>
          <p>We are currently reviewing your membership application for the Botswana Society of Patient Counselling and Psychotherapy (BSPCP).</p>
        </div>

        <p>In order to complete the review process, we require some additional information or clarification regarding your application. Please see the details below:</p>

        <div class="email-body">
          ${body}
        </div>

        <h3>📞 How to Respond:</h3>
        <div class="info-box">
          <strong>Reply to this email</strong> with the requested information, or contact us directly using the details below.
        </div>

        <h3>📬 Contact Information:</h3>
        <div class="contact-info">
          <strong>BSPCP Membership Team</strong><br>
          Email: bspcpemailservice@gmail.com<br>
          Phone: [+267] 123 456 789<br>
          Office Hours: Monday - Friday, 8:00 AM - 5:00 PM<br>
          Address: [Physical Office Address]
        </div>

        <p><strong>⚠️ Important Deadlines:</strong></p>
        <p>Please respond to this request within <strong>14 days</strong> of receiving this email. If we do not receive the requested information within this timeframe, your application may need to be placed on hold or withdrawn.</p>

        <p><strong>📋 What Happens Next?</strong></p>
        <ol>
          <li>You provide the requested information</li>
          <li>Our membership team reviews the additional details</li>
          <li>We will notify you of the final decision on your application</li>
        </ol>

        <p>If you have any questions about this request or need assistance with providing the information, please don't hesitate to contact us.</p>

        <p>We appreciate your cooperation in helping us process your application efficiently.</p>

        <p>Best regards,<br>
        <strong>BSPCP Membership Review Team</strong><br>
        Botswana Society of Patient Counselling and Psychotherapy</p>
      </div>

      <div class="footer">
        <p>This is an automated message from BSPCP Membership System. Please do not reply to this email if you are responding to the information request.</p>
        <p>&copy; ${new Date().getFullYear()} Botswana Society of Patient Counselling and Psychotherapy | All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

const getMemberApprovalEmailTemplate = (fullName, username, setupLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to BSPCP - ${username}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f9620b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #f9620b; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .highlight { background: #ecfdf5; border: 2px solid #059669; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .credentials { background: #f0f9ff; border: 1px solid #0284c7; padding: 15px; border-radius: 5px; margin: 20px 0; font-family: monospace; }
        .link-text { color: #2563eb; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Welcome to BSPCP!</h1>
        <p>Your membership application has been approved</p>
      </div>
      <div class="content">
        <h2>Congratulations ${fullName}!</h2>

        <p>Great news! Your BSPCP membership application has been approved. Welcome to our community of professional counsellors and psychotherapists.</p>

        <div class="highlight">
          <h3>🎉 What's Next?</h3>
          <p>Your account has been created. Now you need to set up your password to complete the activation process.</p>
        </div>

        <div class="credentials">
          <strong>Your Login Credentials:</strong><br>
          <strong>Username:</strong> ${username}<br>
          <em>Your username is auto-generated from your first initial and last name</em>
        </div>

        <p><strong>To activate your account:</strong></p>
        <ol>
          <li>Click the "Set Up My Password" button below</li>
          <li>Create a strong, memorable password</li>
          <li>Read and agree to the terms of service</li>
          <li>Login to your member dashboard</li>
        </ol>

        <a href="${setupLink}" class="button">Set Up My Password</a>

        <div class="credentials">
          <strong>Security Setup Link:</strong><br>
          <span class="link-text">${setupLink}</span><br><br>
          <em>This link expires in 24 hours. If it expires, contact admin for a new setup link.</em>
        </div>

        <p><strong>🏥 About BSPCP:</strong><br>
        The Botswana Society of Patient Counselling and Psychotherapy (BSPCP) is dedicated to supporting professional counsellors and psychotherapists across the country.</p>

        <p><strong>📞 Need Help?</strong><br>
        Contact our membership team at contact@bspcp.org or call our office for assistance.</p>

        <p>We look forward to having you as part of our professional community!</p>

        <p>Best regards,<br>BSPCP Membership Team</p>
      </div>
      <div class="footer">
        <p>This is an automated message from BSPCP. Please save this email for your records.</p>
        <p>&copy; ${new Date().getFullYear()} Botswana Society of Patient Counselling and Psychotherapy</p>
      </div>
    </body>
    </html>
  `;
};

const getAdminPasswordResetEmailTemplate = (fullName, username, resetLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Password Reset - BSPCP</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f9620b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #f9620b; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .alert { background: #fee2e2; border: 1px solid #dc2626; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .link-text { color: #2563eb; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>BSPCP Admin Alert</h1>
        <p>Critical Security Notice</p>
      </div>
      <div class="content">
        <h2>Password Reset Required</h2>

        <div class="alert">
          <strong>Security Action Required:</strong><br>
          A password reset has been initiated for your BSPCP admin account.
        </div>

        <p>Hello ${fullName} (${username}),</p>

        <p>This password reset was initiated by a BSPCP administrator. This typically occurs when:</p>
        <ul>
          <li>A new admin account has been created</li>
          <li>An existing admin has requested a password change</li>
          <li>Security protocols require password rotation</li>
          <li>You've locked yourself out of your account</li>
        </ul>

        <p><strong>You must reset your password to regain access to the admin system.</strong></p>

        <a href="${resetLink}" class="button">Reset Admin Password</a>

        <p><strong>Security Information:</strong></p>
        <ul>
          <li>This reset link expires in 1 hour</li>
          <li>Your old password will no longer work after reset</li>
          <li>You will need to login again with your new password</li>
          <li>This action is logged for security purposes</li>
        </ul>

        <p>If you did not request this password reset or believe this email was sent in error, please contact the BSPCP technical team immediately.</p>

        <p>Best regards,<br>BSPCP System Administrator</p>
      </div>
      <div class="footer">
        <p>This is an automated security message from BSPCP. Please do not reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} Botswana Society of Patient Counselling and Psychotherapy</p>
      </div>
    </body>
    </html>
  `;
};


// Counsellor booking notification email template
const getCounsellorBookingEmailTemplate = (bookingData, counsellorName, bookingDate, bookingTime) => {
  const urgencyColors = {
    low: '#10b981',      // green
    medium: '#f59e0b',   // amber
    high: '#ef4444',     // red
    critical: '#dc2626'  // red-600
  };

  const urgencyColor = urgencyColors[bookingData.support_urgency.toLowerCase()] || '#6b7280';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Client Booking - BSPCP</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f9620b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .client-info { background: #ffffff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .booking-time { background: #ecfdf5; border: 2px solid #10b981; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
        .urgency-badge { display: inline-block; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .session-details { background: #f0f9ff; border: 1px solid #0284c7; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .contact-action { background: #f9620b; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
        .highlight { background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 15px 0; }
        h3 { color: #f9620b; margin-top: 25px; }
        .bold { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📅 New Client Booking</h1>
        <p>You've been booked for a counselling session</p>
      </div>

      <div class="content">
        <h2>Hello ${counsellorName},</h2>

        <p>Great news! A new client has booked a counselling session with you.</p>

        <div class="booking-time">
          <h3 style="margin: 0 0 10px 0; color: #059669;">📅 Session Scheduled</h3>
          <div style="font-size: 24px; font-weight: bold; color: #065f46;">
            ${bookingDate}
          </div>
          <div style="font-size: 20px; color: #059669;">
            ${bookingTime}
          </div>
        </div>

        <div class="highlight">
          <strong>⚠️ Important:</strong> Please log in to your member dashboard to view the complete booking details and manage your schedule.
        </div>

        <h3>👤 Client Information</h3>
        <div class="client-info">
          <strong>Name:</strong> ${bookingData.client_name}<br>
          <strong>Phone:</strong> ${bookingData.phone_number}<br>
          <strong>Email:</strong> ${bookingData.email}<br>
          <strong>Session Type:</strong> ${bookingData.session_type || 'Not specified'}<br>
          ${bookingData.support_urgency ? `<strong>Urgency Level:</strong> <span class="urgency-badge" style="background-color: ${urgencyColor};">${bookingData.support_urgency}</span>` : ''}
        </div>

        <h3>🗣️ Session Details</h3>
        <div class="session-details">
          <strong>Category:</strong> ${bookingData.category || 'General Counselling'}<br>
          ${bookingData.needs ? `<strong>Client Needs:</strong> ${bookingData.needs}<br>` : ''}
          <strong>Status:</strong> ${bookingData.status || 'Pending'}
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.BASE_URL || 'https://localhost:5173'}/login" class="contact-action">
            📱 Access Your Dashboard
          </a>
        </div>

        <h3>📞 Need to Contact the Client?</h3>
        <p>You can contact the client directly using the information provided above, or use the member dashboard to manage this booking.</p>

        <p><strong>Remember:</strong> Always maintain client confidentiality and adhere to BSPCP's Code of Ethics.</p>

        <p>If you need assistance or have questions about this booking, please contact BSPCP support.</p>

        <p>Best regards,<br>BSPCP Booking System</p>
      </div>

      <div class="footer">
        <p>This is an automated message from BSPCP. This booking was created in the BSPCP client booking system.</p>
        <p>&copy; ${new Date().getFullYear()} Botswana Society of Patient Counselling and Psychotherapy</p>
      </div>
    </body>
    </html>
  `;
};

const getApplicationNotificationEmailTemplate = (applicationData, memberId, applicationUrl, applicationDate) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New BSPCP Membership Application</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f9620b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #f9620b; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .info-box { background: #f0f9ff; border: 1px solid #0284c7; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .highlight { background: #ecfdf5; border: 2px solid #059669; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .link-text { color: #2563eb; word-break: break-all; }
        h3 { color: #f9620b; margin-top: 25px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>New Membership Application</h1>
        <p>${applicationData.firstName} ${applicationData.lastName}</p>
      </div>
      <div class="content">
        <div class="highlight">
          <h2>🚨 Action Required: New BSPCP Membership Application</h2>
          <p>A new membership application has been submitted and requires your review.</p>
        </div>

        <p><strong>Application Date:</strong> ${applicationDate}</p>
        <p><strong>Application ID:</strong> ${memberId}</p>

        <h3>👤 Personal Information</h3>
        <div class="info-box">
          <strong>Name:</strong> ${applicationData.firstName} ${applicationData.lastName}<br>
          <strong>Email:</strong> ${applicationData.email}<br>
          <strong>Phone:</strong> ${applicationData.phone}<br>
          <strong>Nationality:</strong> ${applicationData.nationality}<br>
          <strong>Date of Birth:</strong> ${applicationData.dateOfBirth}
        </div>

        <h3>🎓 Professional Qualifications</h3>
        <div class="info-box">
          <strong>Highest Qualification:</strong> ${applicationData.highestQualification || 'Not specified'}<br>
          <strong>Employment Status:</strong> ${applicationData.employmentStatus || 'Not specified'}<br>
          <strong>Years of Experience:</strong> ${applicationData.yearsExperience || 'Not specified'}<br>
          <strong>Organization:</strong> ${applicationData.organizationName || 'Not specified'}
        </div>

        <p><strong>🔗 Quick Actions:</strong></p>
        <a href="${applicationUrl}" class="button">Review Application in Admin Panel</a>

        <div class="info-box">
          <strong>Admin Panel URL:</strong><br>
          <span class="link-text">${applicationUrl}</span>
        </div>

        <p>This application is currently pending review. Please log in to the admin panel to approve or reject this application.</p>

        <p>Best regards,<br>BSPCP System Administrator</p>
      </div>
      <div class="footer">
        <p>This is an automated notification from BSPCP. Do not reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} Botswana Society of Patient Counselling and Psychotherapy</p>
      </div>
    </body>
    </html>
  `;
};

// Send general email to multiple recipients
export const sendEmail = async (recipients, subject, body) => {
  try {
    const transporter = createTransporter();

    // Ensure recipients is an array
    const recipientList = Array.isArray(recipients) ? recipients : recipients.split(',').map(r => r.trim()).filter(r => r);

    if (recipientList.length === 0) {
      throw new Error('No valid recipients provided');
    }

    const mailOptions = {
      from: `"BSPCP Admin" <${process.env.GMAIL_USER}>`,
      to: recipientList,
      subject: subject,
      html: body
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${recipientList.length} recipients:`, recipientList);
    return result;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    throw error;
  }
};
