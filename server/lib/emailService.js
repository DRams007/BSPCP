import nodemailer from 'nodemailer';

// Create reusable transporter object using configurable SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT) || 465,
    secure: process.env.MAIL_SECURE === 'true', // Use SSL for port 465
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Get the from address for emails
const getFromAddress = () => {
  return process.env.MAIL_FROM || `"BSPCP Admin" <${process.env.MAIL_USER}>`;
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
      from: getFromAddress(),
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
      from: getFromAddress(),
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
      from: `"BSPCP System" <${process.env.MAIL_USER}>`,
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

    const recipients = recipientsResult.rows.map(row => row.email);

    // Always include the default notification email (bspcpemail@gmail.com) as a fallback
    const defaultEmail = 'bspcpemail@gmail.com';
    if (!recipients.includes(defaultEmail)) {
      recipients.push(defaultEmail);
    }

    return recipients;
  } catch (error) {
    console.error('Error fetching notification recipients:', error);
    // Fall back to default email if database error occurs
    return ['bspcpemail@gmail.com'];
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
      from: getFromAddress(),
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
      from: `"BSPCP System" <${process.env.MAIL_USER}>`,
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
      from: getFromAddress(),
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
          Email: bspcpemail@gmail.com<br>
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


// Payment request email to member
export const sendPaymentRequestEmail = async (memberEmail, memberName, membershipType, paymentToken) => {
  try {
    const transporter = createTransporter();
    const paymentLink = `${process.env.BASE_URL}/payment-upload?token=${paymentToken}`;

    const membershipPrice = membershipType === 'professional' ? 'BWP 200.00' : 'BWP 200.00';

    const mailOptions = {
      from: `"BSPCP Admin" <${process.env.GMAIL_USER}>`,
      to: memberEmail,
      subject: '💰 Action Required: Submit Proof of Payment - BSPCP Membership',
      html: getPaymentRequestEmailTemplate(memberName, membershipType, membershipPrice, paymentLink)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Payment request email sent successfully to:', memberEmail);
    return result;
  } catch (error) {
    console.error('❌ Failed to send payment request email:', error.message);
    throw error;
  }
};

// Renewal request email to member
export const sendRenewalRequestEmail = async (memberEmail, memberName, membershipType, renewalToken) => {
  try {
    const transporter = createTransporter();
    const renewalLink = `${process.env.BASE_URL}/renewal-upload?token=${renewalToken}`;

    const membershipPrice = membershipType === 'professional' ? 'BWP 150.00' : 'BWP 150.00'; // Renewal fee

    const mailOptions = {
      from: `"BSPCP Admin" <${process.env.GMAIL_USER}>`,
      to: memberEmail,
      subject: '🔔 Action Required: Renew Your BSPCP Membership',
      html: getRenewalRequestEmailTemplate(memberName, membershipType, membershipPrice, renewalLink)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Renewal request email sent successfully to:', memberEmail);
    return result;
  } catch (error) {
    console.error('❌ Failed to send renewal request email:', error.message);
    throw error;
  }
};

// Payment uploaded notification email to admin
export const sendPaymentUploadedNotificationEmail = async (memberData, uploadData) => {
  try {
    // Get notification recipients
    const recipients = await getNotificationRecipients();

    if (recipients.length === 0) {
      console.log('📧 No notification recipients configured for payment uploads');
      return { message: 'No recipients configured' };
    }

    const transporter = createTransporter();
    const adminUrl = `${process.env.BASE_URL}/admin/members`; // TODO: Update to correct admin payments URL
    const uploadedDate = new Date().toLocaleString('en-GB');

    const mailOptions = {
      from: `"BSPCP System" <${process.env.GMAIL_USER}>`,
      to: recipients,
      subject: `💰 Payment Proof Uploaded - ${memberData.name} (${memberData.membershipType})`,
      html: getPaymentUploadedNotificationEmailTemplate(memberData, uploadData, adminUrl, uploadedDate)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`📧 Payment upload notification sent to ${recipients.length} admins:`, recipients);
    return result;
  } catch (error) {
    console.error('❌ Failed to send payment upload notification email:', error.message);
    throw error;
  }
};

// Payment verification email to member
export const sendPaymentVerifiedEmail = async (memberEmail, memberName, adminName, adminNotes) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"BSPCP Admin" <${process.env.GMAIL_USER}>`,
      to: memberEmail,
      subject: '🎉 Payment Verified - Welcome to BSPCP Membership!',
      html: getPaymentVerificationEmailTemplate(memberName, 'verified', {}, adminNotes)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Payment verification success email sent successfully to:', memberEmail);
    return result;
  } catch (error) {
    console.error('❌ Failed to send payment verification email:', error.message);
    throw error;
  }
};

// Payment rejection email to member
export const sendPaymentRejectedEmail = async (memberEmail, memberName, adminName, rejectionReason, uploadToken) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"BSPCP Admin" <${process.env.GMAIL_USER}>`,
      to: memberEmail,
      subject: '❌ Payment Verification Issue - Action Required',
      html: getPaymentVerificationEmailTemplate(memberName, 'rejected', {}, rejectionReason, uploadToken)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Payment rejection email sent successfully to:', memberEmail);
    return result;
  } catch (error) {
    console.error('❌ Failed to send payment rejection email:', error.message);
    throw error;
  }
};

// Renewal verification email to member
export const sendRenewalVerifiedEmail = async (memberEmail, memberName, adminName, adminNotes) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"BSPCP Admin" <${process.env.GMAIL_USER}>`,
      to: memberEmail,
      subject: '🎉 Membership Renewed - Thank You for Your Continued Support!',
      html: getRenewalVerificationEmailTemplate(memberName, 'verified', {}, adminNotes)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Renewal verification success email sent successfully to:', memberEmail);
    return result;
  } catch (error) {
    console.error('❌ Failed to send renewal verification email:', error.message);
    throw error;
  }
};

// Renewal rejection email to member
export const sendRenewalRejectedEmail = async (memberEmail, memberName, adminName, rejectionReason, renewalToken) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"BSPCP Admin" <${process.env.GMAIL_USER}>`,
      to: memberEmail,
      subject: '❌ Membership Renewal Issue - Action Required',
      html: getRenewalVerificationEmailTemplate(memberName, 'rejected', {}, rejectionReason, renewalToken)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Renewal rejection email sent successfully to:', memberEmail);
    return result;
  } catch (error) {
    console.error('❌ Failed to send renewal rejection email:', error.message);
    throw error;
  }
};

// Payment verification email to member (legacy function - replaced by verified/rejected specific functions)
export const sendPaymentVerificationEmail = async (memberEmail, memberName, verificationResult, paymentData, adminNotes = '') => {
  try {
    const transporter = createTransporter();
    const isVerified = verificationResult === 'verified';

    const mailOptions = {
      from: `"BSPCP Admin" <${process.env.GMAIL_USER}>`,
      to: memberEmail,
      subject: isVerified
        ? '🎉 Payment Verified - Welcome to BSPCP Membership!'
        : '❌ Payment Verification Issue - Action Required',
      html: getPaymentVerificationEmailTemplate(memberName, verificationResult, paymentData, adminNotes)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Payment verification email sent successfully to:', memberEmail);
    return result;
  } catch (error) {
    console.error('❌ Failed to send payment verification email:', error.message);
    throw error;
  }
};


// Payment request email template
const getPaymentRequestEmailTemplate = (memberName, membershipType, membershipPrice, paymentLink) => {
  const memberTypeDisplay = membershipType === 'professional' ? 'Professional' : 'Student';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Submit Proof of Payment - BSPCP Membership</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f9620b 0%, #ff8534 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #f9620b; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: bold; font-size: 16px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .bank-details { background: #ffffff; border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .price-highlight { background: #ecfdf5; border: 2px solid #059669; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
        .alert { background: #fee2e2; border: 2px solid #dc2626; padding: 15px; border-radius: 5px; margin: 20px 0; color: #991b1b; }
        .link-text { color: #2563eb; word-break: break-all; }
        h3 { color: #f9620b; margin-top: 30px; margin-bottom: 15px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💰 Payment Required</h1>
        <p>Complete your ${memberTypeDisplay} membership application</p>
      </div>

      <div class="content">
        <h2>Hello ${memberName},</h2>

        <p>Thank you for your interest in joining the Botswana Society of Patient Counselling and Psychotherapy (BSPCP). Your membership application has been approved and is now ready for the final step: payment verification.</p>

        <div class="price-highlight">
          <h3 style="margin: 0 0 10px 0; color: #047857;">💰 Membership Fee</h3>
          <div style="font-size: 24px; font-weight: bold; color: #065f46;">
            ${membershipPrice}
          </div>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #047857;">(BWP 50.00 Joining Fee + BWP 150.00 Annual Fee)</p>
        </div>

        <h3>🏦 Payment Instructions</h3>
        <p>Please make payment to the following account:</p>

        <div class="bank-details">
          <h4 style="margin: 0 0 15px 0; color: #374151;">💳 Bank Transfer Details</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-family: monospace;">
            <div><strong>Bank Name:</strong>Stanbic Bank of Botswana</div>
            <div><strong>Branch:</strong>Fairground Branch (Branch No: 1011)</div>
            <div><strong>Account Name:</strong>Botswana Society of Professional Counsellors and Psychotherapists</div>
            <div><strong>Account Number:</strong>906 000 5981 641</div>
            <div><strong>Branch Code:</strong> 064 967</div>
          </div>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <strong>Reference:</strong> BSPCP-${Date.now().toString().slice(-6)}
          </div>
        </div>

        <h3>📤 Submit Payment Proof</h3>
        <p>Once you've completed the payment, click the button below to upload your proof of payment:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${paymentLink}" class="button">📤 Upload Payment Proof</a>
        </div>

        <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Secure Upload Link:</strong><br>
          <span class="link-text">${paymentLink}</span><br><br>
          <em>This link expires in 30 days for security reasons.</em>
        </div>

        <div class="alert">
          <strong>⚠️ Important:</strong><br>
          Please submit your payment proof within <strong>30 days</strong> to complete your membership activation. After this period, you may need to reapply.
        </div>

        <h3>📋 What to Upload</h3>
        <p>Please upload a clear photo or scan of:</p>
        <ul style="padding-left: 20px;">
          <li>Bank transfer receipt/deposit slip</li>
          <li>Mobile banking confirmation</li>
          <li>ATM receipt (if applicable)</li>
        </ul>

        <p><strong>Requirements:</strong></p>
        <ul style="padding-left: 20px;">
          <li>Document must be clearly readable</li>
          <li>Reference number should be visible</li>
          <li>Amount and date should be clearly shown</li>
          <li>Accepted formats: PDF, JPG, JPEG, PNG</li>
          <li>Maximum file size: 5MB</li>
        </ul>

        <p>If you encounter any issues or need assistance, please contact our membership team.</p>

        <p>Thank you for joining the BSPCP community!</p>

        <p>Best regards,<br>
        <strong>BSPCP Membership Team</strong><br>
        Botswana Society of Patient Counselling and Psychotherapy</p>
      </div>

      <div class="footer">
        <p>This is an automated message from the BSPCP Membership System. Please do not reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} Botswana Society of Patient Counselling and Psychotherapy | All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

// Renewal request email template
const getRenewalRequestEmailTemplate = (memberName, membershipType, membershipPrice, renewalLink) => {
  const memberTypeDisplay = membershipType === 'professional' ? 'Professional' : 'Student';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Renew Your BSPCP Membership</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f9620b 0%, #ff8534 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #f9620b; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: bold; font-size: 16px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .bank-details { background: #ffffff; border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .price-highlight { background: #ecfdf5; border: 2px solid #059669; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
        .alert { background: #fee2e2; border: 2px solid #dc2626; padding: 15px; border-radius: 5px; margin: 20px 0; color: #991b1b; }
        .link-text { color: #2563eb; word-break: break-all; }
        h3 { color: #f9620b; margin-top: 30px; margin-bottom: 15px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔔 Membership Renewal Required</h1>
        <p>Renew your ${memberTypeDisplay} membership to stay active</p>
      </div>

      <div class="content">
        <h2>Hello ${memberName},</h2>

        <p>Your annual BSPCP membership is due for renewal. To continue enjoying your member benefits, please renew your membership by submitting proof of payment for the annual fee.</p>

        <div class="price-highlight">
          <h3 style="margin: 0 0 10px 0; color: #047857;">💰 Annual Renewal Fee</h3>
          <div style="font-size: 24px; font-weight: bold; color: #065f46;">
            ${membershipPrice}
          </div>
        </div>

        <h3>🏦 Payment Instructions</h3>
        <p>Please make payment to the following account:</p>

        <div class="bank-details">
          <h4 style="margin: 0 0 15px 0; color: #374151;">💳 Bank Transfer Details</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-family: monospace;">
            <div><strong>Bank Name:</strong>Stanbic Bank of Botswana</div>
            <div><strong>Branch:</strong>Fairground Branch (Branch No: 1011)</div>
            <div><strong>Account Name:</strong>Botswana Society of Professional Counsellors and Psychotherapists</div>
            <div><strong>Account Number:</strong>906 000 5981 641</div>
            <div><strong>Branch Code:</strong> 064 967</div>
          </div>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <strong>Reference:</strong> BSPCP-REN-${Date.now().toString().slice(-6)}
          </div>
        </div>

        <h3>📤 Submit Renewal Proof</h3>
        <p>Once you've completed the payment, click the button below to upload your proof of payment:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${renewalLink}" class="button">📤 Upload Renewal Proof</a>
        </div>

        <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Secure Upload Link:</strong><br>
          <span class="link-text">${renewalLink}</span><br><br>
          <em>This link expires in 30 days for security reasons.</em>
        </div>

        <div class="alert">
          <strong>⚠️ Important:</strong><br>
          Please submit your renewal proof within <strong>30 days</strong> to avoid interruption of your membership benefits.
        </div>

        <p>If you encounter any issues or need assistance, please contact our membership team.</p>

        <p>Thank you for your continued commitment to the BSPCP.</p>

        <p>Best regards,<br>
        <strong>BSPCP Membership Team</strong><br>
        Botswana Society of Patient Counselling and Psychotherapy</p>
      </div>

      <div class="footer">
        <p>This is an automated message from the BSPCP Membership System. Please do not reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} Botswana Society of Patient Counselling and Psychotherapy | All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

// Payment uploaded notification email template for admins
const getPaymentUploadedNotificationEmailTemplate = (memberData, uploadData, adminUrl, uploadedDate) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Payment Proof Submitted - BSPCP</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #f97316; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 16px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .member-info { background: #ffffff; border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .upload-details { background: #ecfdf5; border: 2px solid #059669; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .action-required { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .link-text { color: #2563eb; word-break: break-all; }
        h3 { color: #f97316; margin-top: 30px; margin-bottom: 15px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💰 Payment Proof Submitted</h1>
        <p>Awaiting admin verification</p>
      </div>

      <div class="content">
        <h2>🚨 Action Required: Payment Proof Review</h2>

        <div class="action-required">
          <h3 style="margin: 0 0 10px 0; color: #92400e;">⚡ Urgent Review Needed</h3>
          <p style="margin: 0; color: #92400e;"><strong>A member has uploaded payment proof and is awaiting verification to complete their membership activation.</strong></p>
        </div>

        <p><strong>Upload Date:</strong> ${uploadedDate}</p>

        <h3>👤 Member Information</h3>
        <div class="member-info">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div><strong>Name:</strong> ${memberData.name}</div>
            <div><strong>Email:</strong> ${memberData.email}</div>
            <div><strong>Membership Type:</strong> ${memberData.membershipType === 'professional' ? 'Professional' : 'Student'}</div>
            <div><strong>Member ID:</strong> ${memberData.id}</div>
          </div>
        </div>

        <h3>📄 Upload Details</h3>
        <div class="upload-details">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div><strong>File Name:</strong> ${uploadData.originalFilename || 'N/A'}</div>
            <div><strong>File Type:</strong> ${uploadData.fileType || 'N/A'}</div>
            <div><strong>File Size:</strong> ${uploadData.fileSize ? `${(uploadData.fileSize / 1024).toFixed(1)} KB` : 'N/A'}</div>
            <div><strong>Reference:</strong> ${uploadData.paymentReference || 'N/A'}</div>
          </div>
          ${uploadData.paymentAmount ? `<div><strong>Payment Amount:</strong> BWP ${uploadData.paymentAmount}</div>` : ''}
          ${uploadData.bankName ? `<div><strong>Bank Name:</strong> ${uploadData.bankName}</div>` : ''}
          ${uploadData.paymentDate ? `<div><strong>Payment Date:</strong> ${new Date(uploadData.paymentDate).toLocaleDateString('en-GB')}</div>` : ''}
          ${uploadData.additionalNotes ? `<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #059669;"><strong>Additional Notes:</strong> ${uploadData.additionalNotes}</div>` : ''}
        </div>

        <p><strong>🔗 Quick Actions:</strong></p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${adminUrl}" class="button">👀 Review Payment Proof</a>
        </div>

        <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Admin Panel URL:</strong><br>
          <span class="link-text">${adminUrl}</span>
        </div>

        <h3>⚡ Verification Process</h3>
        <ol style="padding-left: 20px;">
          <li>Access the admin panel using the link above</li>
          <li>Review the uploaded payment proof document</li>
          <li>Verify payment details match bank records</li>
          <li>Approve or reject the payment with notes if needed</li>
          <li>Member receives automated verification email</li>
        </ol>

        <p><strong>Expected verification time:</strong> 1-2 business days to maintain service quality.</p>

        <p>If you have any questions or need assistance with the verification process, please contact the technical team.</p>

        <p>Best regards,<br>BSPCP Payment Verification System</p>
      </div>

      <div class="footer">
        <p>This is an automated notification from BSPCP. This payment proof requires urgent admin review.</p>
        <p>&copy; ${new Date().getFullYear()} Botswana Society of Patient Counselling and Psychotherapy</p>
      </div>
    </body>
    </html>
  `;
};

// Payment verification result email template
const getPaymentVerificationEmailTemplate = (memberName, verificationResult, paymentData, adminNotes, uploadToken = null) => {
  const isVerified = verificationResult === 'verified';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment ${isVerified ? 'Verified' : 'Rejected'} - BSPCP</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${isVerified ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}; color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: ${isVerified ? '#10b981' : '#ef4444'}; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 16px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .member-status { background: ${isVerified ? '#ecfdf5' : '#fef2f2'}; border: 2px solid ${isVerified ? '#059669' : '#dc2626'}; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .payment-details { background: #ffffff; border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        ${!isVerified ? '.rejection-notes { background: #fee2e2; border: 2px solid #dc2626; padding: 15px; border-radius: 5px; margin: 20px 0; color: #991b1b; }' : ''}
        .next-steps { background: ${isVerified ? '#fef3c7' : '#f0f9ff'}; border: 2px solid ${isVerified ? '#f59e0b' : '#0284c7'}; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .step-item { margin: 8px 0; padding-left: 20px; position: relative; }
        .step-item:before { content: ${isVerified ? '"🎯"' : '"⚠️"'}; position: absolute; left: 0; }
        .link-text { color: #2563eb; word-break: break-all; }
        h3 { color: ${isVerified ? '#059669' : '#dc2626'}; margin-top: 30px; margin-bottom: 15px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${isVerified ? '🎉 Payment Verified!' : '❌ Payment Verification Issue'}</h1>
        <p>${isVerified ? 'Welcome to BSPCP Membership!' : 'Action Required for Membership'}</p>
      </div>

      <div class="content">
        <h2>Hello ${memberName},</h2>

        <div class="member-status">
          <h3 style="margin: 0 0 10px 0; color: ${isVerified ? '#059669' : '#dc2626'};">
            ${isVerified ? '✅ Payment Successfully Verified' : '❌ Payment Verification Failed'}
          </h3>
          <p style="margin: 0; font-size: 16px; font-weight: ${isVerified ? 'bold' : 'normal'}; color: ${isVerified ? '#065f46' : '#991b1b'};">
            Your membership ${isVerified ? 'is now fully activated!' : 'requires attention'}
          </p>
        </div>

        ${isVerified ? `        <h3>💰 Payment Details</h3>
        <div class="payment-details">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            ${paymentData.paymentReference ? `<div><strong>Reference:</strong> ${paymentData.paymentReference}</div>` : ''}
            ${paymentData.paymentAmount ? `<div><strong>Amount:</strong> BWP ${paymentData.paymentAmount}</div>` : ''}
            ${paymentData.paymentDate ? `<div><strong>Date:</strong> ${new Date(paymentData.paymentDate).toLocaleDateString('en-GB')}</div>` : ''}
            ${paymentData.bankName ? `<div><strong>Bank:</strong> ${paymentData.bankName}</div>` : ''}
          </div>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <strong>Verification Date:</strong> ${new Date().toLocaleString('en-GB')}
          </div>
        </div>
        ` : ''}

        ${!isVerified && adminNotes ? `
        <div class="rejection-notes">
          <h4 style="margin: 0 0 10px 0;">🔍 Admin Notes:</h4>
          <div style="background: #ffffff; padding: 10px; border-radius: 4px; border: 1px solid #dc2626;">
            ${adminNotes}
          </div>
        </div>
        ` : ''}

        ${!isVerified && uploadToken ? `
        <div style="background: #ecfdf5; border: 2px solid #059669; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #059669;">🔄 Submit New Payment Proof</h3>
          <p>You can re-submit your payment proof using the secure link below. This link will expire in 30 days for security reasons.</p>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.BASE_URL}/payment-upload?token=${uploadToken}" class="button">📤 Upload Payment Proof</a>
          </div>

          <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 5px;">
            <strong>Secure Upload Link:</strong><br>
            <span class="link-text">${process.env.BASE_URL}/payment-upload?token=${uploadToken}</span>
          </div>
        </div>
        ` : ''}

        <div class="next-steps">
          <h3 style="margin: 0 0 15px 0; color: ${isVerified ? '#92400e' : '#1e40af'};">
            ${isVerified ? '🎯 What\'s Next?' : '⚠️ Required Actions'}
          </h3>

          ${isVerified ? `
          <div class="step-item">Your membership is now activated and you can access all member benefits</div>
          <div class="step-item">Log in to your member dashboard for exclusive resources and networking</div>
          <div class="step-item">Consider joining professional development workshops and events</div>
          <div class="step-item">Update your profile with additional qualifications and experience</div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.BASE_URL}/member-login" class="button">🚀 Access Member Dashboard</a>
          </div>
          ` : `
          <div class="step-item">Review the admin notes above for specific requirements</div>
          <div class="step-item">Prepare a new, clearer payment proof document</div>
          <div class="step-item">Re-submit payment proof using the original link</div>
          <div class="step-item">Allow 1-2 business days for re-verification</div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.BASE_URL || 'https://localhost:5173'}/contact" class="button">📞 Contact Support</a>
          </div>
          `}
        </div>

        ${isVerified ? `
        <h3>💳 Membership Benefits</h3>
        <ul style="padding-left: 20px;">
          <li><strong>Professional Networking:</strong> Connect with BSPCP members nationwide</li>
          <li><strong>Continuing Professional Development:</strong> Access to workshops, webinars, and training</li>
          <li><strong>Resource Library:</strong> Exclusive access to counselling resources and research</li>
          <li><strong>Certification Recognition:</strong> Official BSPCP membership recognition</li>
          <li><strong>Events & Conferences:</strong> Discounted rates for BSPCP events</li>
          <li><strong>Industry Updates:</strong> Latest developments in counselling and psychotherapy</li>
        </ul>

        <p><strong>Welcome to the BSPCP community!</strong> We're excited to have you join our professional network.</p>
        ` : `
        <h3>🔄 Need Help?</h3>
        <p>If you need assistance with re-submitting your payment proof or have questions about the verification process, please don't hesitate to contact us:</p>

        <div style="background: #ecfdf5; border: 2px solid #059669; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>BSPCP Support Team</strong><br>
          Email: bspcpemail@gmail.com<br>
          Phone: [+267] 123 456 789<br>
          Office Hours: Monday - Friday, 8:00 AM - 5:00 PM
        </div>
        `}

        <p>Best regards,<br>
        <strong>BSPCP Membership Verification Team</strong><br>
        Botswana Society of Patient Counselling and Psychotherapy</p>
      </div>

      <div class="footer">
        <p>This is an automated message from BSPCP Membership Verification System. Please save this email for your records.</p>
        <p>&copy; ${new Date().getFullYear()} Botswana Society of Patient Counselling and Psychotherapy | All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

// Renewal verification result email template
const getRenewalVerificationEmailTemplate = (memberName, verificationResult, paymentData, adminNotes, renewalToken = null) => {
  const isVerified = verificationResult === 'verified';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Membership Renewal ${isVerified ? 'Successful' : 'Issue'} - BSPCP</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${isVerified ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}; color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: ${isVerified ? '#10b981' : '#ef4444'}; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 16px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .member-status { background: ${isVerified ? '#ecfdf5' : '#fef2f2'}; border: 2px solid ${isVerified ? '#059669' : '#dc2626'}; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        ${!isVerified ? '.rejection-notes { background: #fee2e2; border: 2px solid #dc2626; padding: 15px; border-radius: 5px; margin: 20px 0; color: #991b1b; }' : ''}
        .next-steps { background: ${isVerified ? '#fef3c7' : '#f0f9ff'}; border: 2px solid ${isVerified ? '#f59e0b' : '#0284c7'}; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .step-item { margin: 8px 0; padding-left: 20px; position: relative; }
        .step-item:before { content: ${isVerified ? '"🎯"' : '"⚠️"'}; position: absolute; left: 0; }
        .link-text { color: #2563eb; word-break: break-all; }
        h3 { color: ${isVerified ? '#059669' : '#dc2626'}; margin-top: 30px; margin-bottom: 15px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${isVerified ? '🎉 Membership Renewed!' : '❌ Membership Renewal Issue'}</h1>
        <p>${isVerified ? 'Thank you for your continued support!' : 'Action Required for Your Membership'}</p>
      </div>

      <div class="content">
        <h2>Hello ${memberName},</h2>

        <div class="member-status">
          <h3 style="margin: 0 0 10px 0; color: ${isVerified ? '#059669' : '#dc2626'};">
            ${isVerified ? '✅ Renewal Successful' : '❌ Renewal Verification Failed'}
          </h3>
          <p style="margin: 0; font-size: 16px; font-weight: ${isVerified ? 'bold' : 'normal'}; color: ${isVerified ? '#065f46' : '#991b1b'};">
            Your membership ${isVerified ? 'is active for another year!' : 'renewal requires attention'}
          </p>
        </div>

        ${!isVerified && adminNotes ? `
        <div class="rejection-notes">
          <h4 style="margin: 0 0 10px 0;">🔍 Admin Notes:</h4>
          <div style="background: #ffffff; padding: 10px; border-radius: 4px; border: 1px solid #dc2626;">
            ${adminNotes}
          </div>
        </div>
        ` : ''}

        ${!isVerified && renewalToken ? `
        <div style="background: #ecfdf5; border: 2px solid #059669; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #059669;">🔄 Submit New Renewal Proof</h3>
          <p>You can re-submit your renewal proof using the secure link below. This link will expire in 30 days for security reasons.</p>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.BASE_URL}/renewal-upload?token=${renewalToken}" class="button">📤 Upload Renewal Proof</a>
          </div>

          <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 5px;">
            <strong>Secure Upload Link:</strong><br>
            <span class="link-text">${process.env.BASE_URL}/renewal-upload?token=${renewalToken}</span>
          </div>
        </div>
        ` : ''}

        <div class="next-steps">
          <h3 style="margin: 0 0 15px 0; color: ${isVerified ? '#92400e' : '#1e40af'};">
            ${isVerified ? '🎯 What\'s Next?' : '⚠️ Required Actions'}
          </h3>

          ${isVerified ? `
          <div class="step-item">Your membership is now active for another year.</div>
          <div class="step-item">You can continue to access all member benefits.</div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.BASE_URL || 'https://localhost:5173'}/login" class="button">🚀 Access Member Dashboard</a>
          </div>
          ` : `
          <div class="step-item">Review the admin notes above for specific requirements</div>
          <div class="step-item">Prepare a new, clearer renewal proof document</div>
          <div class="step-item">Re-submit renewal proof using the link provided</div>
          <div class="step-item">Allow 1-2 business days for re-verification</div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.BASE_URL || 'https://localhost:5173'}/contact" class="button">📞 Contact Support</a>
          </div>
          `}
        </div>

        <p>Best regards,<br>
        <strong>BSPCP Membership Team</strong><br>
        Botswana Society of Patient Counselling and Psychotherapy</p>
      </div>

      <div class="footer">
        <p>This is an automated message from the BSPCP Membership System. Please save this email for your records.</p>
        <p>&copy; ${new Date().getFullYear()} Botswana Society of Patient Counselling and Psychotherapy | All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

// Contact message email template
export const getContactMessageEmailTemplate = (contactData, messageId) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Message - BSPCP</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f9620b 0%, #ff8534 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .contact-details { background: #ffffff; border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .message-content { background: #ffffff; border: 2px solid #2665a8; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .inquiry-badge { display: inline-block; background: #f9620b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .action-button { display: inline-block; background: #f9620b; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .priority { background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .contact-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .contact-info-item { background: #f0f9ff; padding: 10px; border-radius: 4px; border: 1px solid #0284c7; }
        h3 { color: #f9620b; margin-top: 30px; margin-bottom: 15px; }
        .message-quote { font-style: italic; color: #374151; background: #f9fafb; padding: 15px; border-left: 4px solid #f9620b; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💬 New Contact Message</h1>
        <p>Inquiry from BSPCP website visitor</p>
      </div>

      <div class="content">
        <div class="priority">
          <h3 style="margin: 0 0 10px 0; color: #92400e;">📬 New Customer Inquiry</h3>
          <p style="margin: 0; color: #92400e;"><strong>A visitor has submitted a message from the contact form on the BSPCP website and is awaiting a response.</strong></p>
        </div>

        <p><strong>Received:</strong> ${new Date().toLocaleString('en-GB')}</p>

        <h3>👤 Contact & Message Details</h3>
        <div class="contact-details">
          <div class="contact-info-grid">
            <div class="contact-info-item">
              <strong>Name:</strong>
              ${contactData.firstName} ${contactData.lastName}
            </div>
            <div class="contact-info-item">
              <strong>Email:</strong>
              <a href="mailto:${contactData.email}" style="color: #0369a1; text-decoration: none;">${contactData.email}</a>
            </div>
            ${contactData.phone ? `
            <div class="contact-info-item">
              <strong>Phone:</strong>
              <a href="tel:${contactData.phone}" style="color: #0369a1; text-decoration: none;">${contactData.phone}</a>
            </div>
            ` : ''}
            <div class="contact-info-item">
              <strong>Inquiry Type:</strong>
              <span class="inquiry-badge">${contactData.inquiryType}</span>
            </div>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <strong>Subject:</strong> ${contactData.subject}
            ${contactData.needs ? `<strong>Category/Service Needed:</strong> ${contactData.needs}<br>` : ''}
          </div>

          <div style="margin-top: 20px; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
            <h4 style="margin: 0 0 10px 0; color: #1f2937; font-size: 14px;">💬 Message Content</h4>
            <div class="message-quote" style="margin: 0;">
              ${contactData.message.replace(/\n/g, '<br>')}
            </div>
          </div>
        </div>

        <h3>🎯 Recommended Actions</h3>
        <div style="background: #ecfdf5; border: 2px solid #059669; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 15px 0; color: #065f46;">📋 Quick Response Guide</h4>
          <ol style="padding-left: 20px; color: #065f46;">
            <li><strong>Review the message content above</strong></li>
            <li><strong>Classify the inquiry priority:</strong> ${contactData.inquiryType === 'complaint' ? 'High Priority ⚡' : contactData.inquiryType === 'professional' ? 'Medium Priority 📊' : 'Normal Priority 💬'}</li>
            <li><strong>Draft a personalized response</strong> addressing their specific concerns</li>
            <li><strong>Reference their message ID (${messageId})</strong> in your reply</li>
            <li><strong>Respond within ${contactData.inquiryType === 'complaint' ? '24 hours' : '48 hours'}</strong> for best customer service</li>
          </ol>
        </div>

        <h3>🚀 Quick Actions</h3>
        <p>Use these buttons to respond quickly:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="mailto:${contactData.email}?subject=Re: ${contactData.subject} (ID: ${messageId})" class="action-button">
            ✉️ Reply by Email
          </a><br><br>
          <a href="https://wa.me/${contactData.phone?.replace(/[^0-9]/g, '')}" target="_blank" class="action-button" style="background: #25d366;">
            📞 Contact via WhatsApp
          </a><br><br>
          <span style="display: block; font-size: 12px; color: #666; margin-top: 10px;">
            These links will automatically include the message subject and ID for easy reference
          </span>
        </div>



        <p><strong>📊 Inquiry Statistics:</strong></p>
        <div style="background: #f0f9ff; border: 1px solid #0284c7; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <strong>Inquiry Type:</strong> ${contactData.inquiryType}<br>
          <strong>Priority Level:</strong> ${contactData.inquiryType === 'complaint' ? 'High (Immediate Response)' : contactData.inquiryType === 'professional' ? 'Medium (Business Day)' : 'Normal (2-3 Days)'}<br>
          <strong>Department:</strong> ${contactData.inquiryType === 'membership' ? 'Membership Team' : contactData.inquiryType === 'professional' ? 'Professional Services' : contactData.inquiryType === 'complaint' ? 'Quality Assurance' : 'General Inquiry'}
        </div>

        <p>This message was submitted through the BSPCP website contact form. Please provide a professional and timely response to maintain our commitment to excellent customer service.</p>

        <p><strong>For urgent complaints or critical matters,</strong> please escalate to the senior management team immediately.</p>

        <p>Best regards,<br>
        <strong>BSPCP Automatic Notification System</strong><br>
        Botswana Society of Patient Counselling and Psychotherapy</p>
      </div>

      <div class="footer">
        <p>This is an automated notification from BSPCP Contact Form System. All contact form submissions are monitored and require timely responses.</p>
        <p>&copy; ${new Date().getFullYear()} Botswana Society of Patient Counselling and Psychotherapy | Website: www.bspcp.org.bw</p>
      </div>
    </body>
    </html>
  `;
};


// application rejection email to member
export const sendApplicationRejectedEmail = async (email, fullName, rejectionReason) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: getFromAddress(),
      to: email,
      subject: 'Update on Your BSPCP Membership Application',
      html: getApplicationRejectedEmailTemplate(fullName, rejectionReason)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Application rejection email sent successfully to:', email);
    return result;
  } catch (error) {
    console.error('❌ Failed to send application rejection email:', error.message);
    throw error;
  }
};

const getApplicationRejectedEmailTemplate = (fullName, rejectionReason) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BSPCP Membership Application Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .rejection-reason { background: #fee2e2; border: 1px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Membership Application Update</h1>
      </div>
      <div class="content">
        <h2>Dear ${fullName},</h2>
        <p>Thank you for your interest in joining the Botswana Society of Patient Counselling and Psychotherapy (BSPCP). We appreciate you taking the time to submit your application.</p>
        <p>After careful review, we regret to inform you that your application for membership has not been approved at this time. </p>
        <div class="rejection-reason">
          <h3>Reason for Decision</h3>
          <p>${rejectionReason}</p>
        </div>
        <h3>What's Next?</h3>
        <p>We understand this may be disappointing. If you believe there has been a misunderstanding, or if you have new information to provide that addresses the reason for rejection, you are welcome to re-apply in the future.</p>
        <p>If you have any questions, please do not hesitate to contact our membership team at <a href="mailto:bspcpemail@gmail.com">bspcpemail@gmail.com</a>.</p>
        <p>We wish you the best in your professional endeavors.</p>
        <p>Sincerely,<br>The BSPCP Membership Committee</p>
      </div>
      <div class="footer">
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
