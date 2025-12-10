import jwt from 'jsonwebtoken';
import { logAdminAudit } from './lib/auditLogger.js';
import { logAdminActivity } from './lib/activityLogger.js';

// =========================================
// PAYMENT MANAGEMENT ENDPOINTS
// =========================================

// Import email functions
import { sendPaymentVerifiedEmail, sendPaymentRejectedEmail, sendRenewalRequestEmail, sendRenewalVerifiedEmail, sendRenewalRejectedEmail } from './lib/emailService.js';

// Request payment from pending/under_review members (admin only)
export function setupMemberActionsEndpoints(app, authenticateToken, authenticateAdminToken, pool, JWT_SECRET, getFullUrl, sendEmail) {

  app.post('/api/admin/request-payment/:memberId', authenticateAdminToken, async (req, res) => {
    const { memberId } = req.params;
    let client;

    try {
      client = await pool.connect();
      await client.query('BEGIN');

      const memberResult = await client.query(
        `SELECT id, first_name, last_name, member_status, payment_status, membership_type
           FROM members
           WHERE id = $1`,
        [memberId]
      );

      if (memberResult.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        client = null; // Prevent double release in finally block
        return res.status(404).json({ error: 'Member not found' });
      }

      const member = memberResult.rows[0];

      // Allow payment requests for approved members (not just active ones)
      // This allows payment requests for members who are approved but may have different statuses

      const paymentToken = jwt.sign(
        {
          memberId: memberId,
          purpose: 'payment_upload',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      await client.query(
        `UPDATE members
           SET payment_status = 'requested',
               payment_requested_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
        [memberId]
      );

      // Log the payment request in audit trail
      await client.query(
        `INSERT INTO payment_audit_log (member_id, admin_id, action, details, ip_address)
           VALUES ($1, $2, $3, $4, $5)`,
        [
          memberId,
          req.admin.id,
          'payment_requested',
          `Payment requested by admin ${req.admin.firstName} ${req.admin.lastName}`,
          req.ip
        ]
      );

      const emailResult = await client.query(
        `SELECT email FROM member_contact_details WHERE member_id = $1`,
        [memberId]
      );

      const memberEmail = emailResult.rows[0]?.email;
      const memberFullName = `${member.first_name} ${member.last_name}`.trim();

      await client.query('COMMIT');

      // Log admin audit
      await logAdminAudit(pool, {
        adminId: req.admin.id,
        action: 'request_payment',
        resourceType: 'member_payment',
        resourceId: memberId,
        newValues: { payment_status: 'requested' },
        details: `Requested payment from member: ${memberFullName}`,
        req
      });

      if (memberEmail) {
        try {
          // Import the payment request email function
          const { sendPaymentRequestEmail } = await import('./lib/emailService.js');
          await sendPaymentRequestEmail(
            memberEmail,
            memberFullName,
            member.membership_type,
            paymentToken
          );
        } catch (emailError) {
          console.error('❌ Failed to send payment request email:', emailError.message);
        }
      }

      res.json({
        message: 'Payment request sent successfully',
        member: memberFullName,
        paymentToken,
        expiry: '30 days'
      });

    } catch (error) {
      if (client) {
        await client.query('ROLLBACK');
      }
      console.error('Error requesting payment:', error);
      res.status(500).json({ error: 'Failed to request payment', details: error.message });
    } finally {
      if (client) client.release();
    }
  });

  app.post('/api/admin/send-renewal-request/:memberId', authenticateAdminToken, async (req, res) => {
    const { memberId } = req.params;
    let client;

    try {
      client = await pool.connect();
      await client.query('BEGIN');

      const memberResult = await client.query(
        `SELECT id, first_name, last_name, member_status, renewal_status, membership_type
         FROM members
         WHERE id = $1`,
        [memberId]
      );

      if (memberResult.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        client = null; // Prevent double release in finally block
        return res.status(404).json({ error: 'Member not found' });
      }

      const member = memberResult.rows[0];

      // Allow renewal requests for approved members (not just active ones)
      // This allows renewal requests for members who are approved but may have different statuses

      const renewalToken = jwt.sign(
        {
          memberId: memberId,
          purpose: 'renewal_upload',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      await client.query(
        `UPDATE members
         SET renewal_status = 'requested',
             renewal_date = CURRENT_TIMESTAMP,
             renewal_token = $2,
             renewal_token_expires_at = $3
         WHERE id = $1`,
        [memberId, renewalToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
      );

      // Log the renewal request in audit trail
      await client.query(
        `INSERT INTO payment_audit_log (member_id, admin_id, action, details, ip_address)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          memberId,
          req.admin.id,
          'renewal_requested',
          `Renewal requested by admin ${req.admin.firstName} ${req.admin.lastName}`,
          req.ip
        ]
      );

      const emailResult = await client.query(
        `SELECT email FROM member_contact_details WHERE member_id = $1`,
        [memberId]
      );

      const memberEmail = emailResult.rows[0]?.email;
      const memberFullName = `${member.first_name} ${member.last_name}`.trim();

      await client.query('COMMIT');

      // Log admin audit
      await logAdminAudit(pool, {
        adminId: req.admin.id,
        action: 'request_renewal',
        resourceType: 'member_renewal',
        resourceId: memberId,
        newValues: { renewal_status: 'requested' },
        details: `Requested renewal from member: ${memberFullName}`,
        req
      });

      if (memberEmail) {
        try {
          await sendRenewalRequestEmail(
            memberEmail,
            memberFullName,
            member.membership_type,
            renewalToken
          );
        } catch (emailError) {
          console.error('❌ Failed to send renewal request email:', emailError.message);
        }
      }

      res.json({
        message: 'Renewal request sent successfully',
        member: memberFullName,
        renewalToken,
        expiry: '30 days'
      });

    } catch (error) {
      if (client) {
        await client.query('ROLLBACK');
      }
      console.error('Error requesting renewal:', error);
      res.status(500).json({ error: 'Failed to request renewal', details: error.message });
    } finally {
      if (client) client.release();
    }
  });

  // Validate payment upload token (helper endpoint)
  app.get('/api/member/payment-token/:token', async (req, res) => {
    const { token } = req.params;

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      if (decoded.purpose !== 'payment_upload') {
        return res.status(401).json({ error: 'Invalid token type' });
      }

      // Check if token is expired
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return res.status(401).json({ error: 'Token expired' });
      }

      // Verify member still exists and is approved
      const client = await pool.connect();
      const memberResult = await client.query(
        `SELECT id, first_name, last_name, application_status, payment_status, membership_type
         FROM members WHERE id = $1`,
        [decoded.memberId]
      );
      client.release();

      if (memberResult.rows.length === 0) {
        return res.status(404).json({ error: 'Member not found' });
      }

      const member = memberResult.rows[0];
      const isValid = member.application_status === 'approved' &&
        (member.payment_status === 'requested' || member.payment_status === 'uploaded');

      res.json({
        isValid,
        member: member,
        expiry: decoded.exp
      });

    } catch (error) {
      console.error('Token validation error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.get('/api/member/renewal-token/:token', async (req, res) => {
    const { token } = req.params;

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      if (decoded.purpose !== 'renewal_upload') {
        return res.status(401).json({ error: 'Invalid token type' });
      }

      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return res.status(401).json({ error: 'Token expired' });
      }

      const client = await pool.connect();
      const memberResult = await client.query(
        `SELECT id, first_name, last_name, member_status, renewal_status, membership_type
         FROM members WHERE id = $1`,
        [decoded.memberId]
      );
      client.release();

      if (memberResult.rows.length === 0) {
        return res.status(404).json({ error: 'Member not found' });
      }

      const member = memberResult.rows[0];
      const isValid = (member.member_status === 'active' || member.member_status === 'expired') &&
        (member.renewal_status === 'requested' || member.renewal_status === 'uploaded' || member.renewal_status === 'rejected');

      res.json({
        isValid,
        member: member,
        expiry: decoded.exp
      });

    } catch (error) {
      console.error('Token validation error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // Get admin payment records with filtering (using new schema)
  app.get('/api/admin/payment-records', authenticateAdminToken, async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const client = await pool.connect();

      let query = `
        SELECT
          m.id,
          m.payment_status,
          m.payment_uploaded_at,
          m.payment_verified_at,
          m.payment_rejected_at,
          m.payment_proof_url,
          m.first_name,
          m.last_name,
          m.bspcp_membership_number,
          m.payment_requested_at,
          mpd.email,
          mpd.phone
        FROM members m
        LEFT JOIN member_contact_details mpd ON m.id = mpd.member_id
        WHERE m.application_status = 'approved'
      `;

      const queryParams = [];
      let paramIndex = 1;

      if (status && status !== 'all') {
        query += ` AND m.payment_status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }

      query += ` ORDER BY m.payment_uploaded_at DESC NULLS LAST`;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(parseInt(limit), offset);

      const result = await client.query(query, queryParams);

      // Get total count for pagination
      const countQuery = status && status !== 'all' ?
        `SELECT COUNT(*) FROM members WHERE application_status = 'approved' AND payment_status = $1` :
        `SELECT COUNT(*) FROM members WHERE application_status = 'approved' AND payment_status IS NOT NULL`;

      const countParams = status && status !== 'all' ? [status] : [];
      const countResult = await client.query(countQuery, countParams);
      const totalRecords = parseInt(countResult.rows[0].count);

      client.release();

      const paymentRecords = result.rows.map(record => ({
        id: record.id,
        status: record.payment_status,
        submittedAt: record.payment_uploaded_at,
        reviewedAt: record.payment_verified_at || record.payment_rejected_at,
        reviewComment: record.payment_status === 'rejected' ? 'Payment proof was rejected' : null,
        proofOfPaymentUrl: record.payment_proof_url ? getFullUrl(record.payment_proof_url, req) : null,
        member: {
          id: record.id,
          name: `${record.first_name} ${record.last_name}`.trim(),
          membershipNumber: record.bspcp_membership_number,
          email: record.email,
          phone: record.phone
        },
        paymentStatus: record.payment_status,
        requestedAt: record.payment_requested_at
      }));

      res.json({
        paymentRecords,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalRecords,
          totalPages: Math.ceil(totalRecords / limit)
        }
      });

    } catch (error) {
      console.error('Error fetching payment records:', error);
      res.status(500).json({ error: 'Failed to fetch payment records', details: error.message });
    }
  });

  // Verify payment proof (admin only - using new schema)
  app.post('/api/admin/payment-records/:id/verify', authenticateAdminToken, async (req, res) => {
    const { id } = req.params;
    const { reviewComment } = req.body;
    let client;

    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // Get current member payment information
      const memberResult = await client.query(
        `SELECT m.id, payment_status, first_name, last_name, mcd.email
         FROM members m
         LEFT JOIN member_contact_details mcd ON m.id = mcd.member_id
         WHERE m.id = $1`,
        [id]
      );

      if (memberResult.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        client = null; // Prevent double release in finally block
        return res.status(404).json({ error: 'Member not found' });
      }

      const member = memberResult.rows[0];

      if (member.payment_status !== 'uploaded') {
        await client.query('ROLLBACK');
        client.release();
        client = null; // Prevent double release in finally block
        return res.status(400).json({
          error: 'Only uploaded payments can be verified',
          currentStatus: member.payment_status
        });
      }

      // Update member payment status
      await client.query(
        `UPDATE members
         SET payment_status = 'verified',
             payment_verified_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [id]
      );

      // Log the verification in audit trail
      await client.query(
        `INSERT INTO payment_audit_log (member_id, admin_id, action, details, ip_address)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          id,
          req.admin.id,
          'payment_verified',
          `Payment verified by admin ${req.admin.firstName} ${req.admin.lastName}`,
          req.ip
        ]
      );

      // Insert payment record for application payment (P200 joining fee)
      await client.query(
        `INSERT INTO member_payments (member_id, first_name, last_name, amount, fee_type, verified_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          id,
          member.first_name,
          member.last_name,
          200.00, // P200 (P50 joining + P150 annual)
          'application_fee',
          req.admin.id
        ]
      );

      const memberName = `${member.first_name} ${member.last_name}`.trim();
      const memberEmail = member.email;

      await client.query('COMMIT');

      // Log admin audit
      await logAdminAudit(pool, {
        adminId: req.admin.id,
        action: 'verify_payment',
        resourceType: 'member_payment',
        resourceId: id,
        newValues: { payment_status: 'verified' },
        details: `Verified payment for member: ${memberName}`,
        req
      });

      // Log admin activity notification
      await logAdminActivity(client, {
        type: 'payment_verified',
        title: 'Payment Verified',
        message: `Payment verified for member ${memberName}`,
        priority: 'medium',
        relatedEntity: 'member',
        relatedId: id,
        adminId: req.admin.id,
        details: {
          memberName: memberName,
          amount: 200.00,
          feeType: 'application_fee'
        }
      });

      // Send success email to member
      if (memberEmail) {
        try {
          const emailSent = await sendPaymentVerifiedEmail(
            memberEmail,
            memberName,
            req.admin.firstName + ' ' + req.admin.lastName,
            reviewComment
          );
          if (emailSent) {
            console.log(`📧 Payment verification email sent to ${memberEmail}`);
          }
        } catch (emailError) {
          console.error('❌ Failed to send payment verification email:', emailError.message);
        }
      }

      res.json({
        message: 'Payment verified successfully',
        memberName,
        reviewedBy: `${req.admin.firstName} ${req.admin.lastName}`,
        reviewComment
      });

    } catch (error) {
      if (client) {
        await client.query('ROLLBACK');
      }
      console.error('Error verifying payment:', error);
      res.status(500).json({ error: 'Failed to verify payment', details: error.message });
    } finally {
      if (client) client.release();
    }
  });

  // Reject payment proof (admin only - using new schema)
  app.post('/api/admin/payment-records/:id/reject', authenticateAdminToken, async (req, res) => {
    const { id } = req.params;
    const { reviewComment } = req.body;
    let client;

    if (!reviewComment || reviewComment.trim().length === 0) {
      return res.status(400).json({ error: 'Review comment is required for rejection' });
    }

    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // Get current member payment information
      const memberResult = await client.query(
        `SELECT m.id, payment_status, first_name, last_name, mcd.email
         FROM members m
         LEFT JOIN member_contact_details mcd ON m.id = mcd.member_id
         WHERE m.id = $1`,
        [id]
      );

      if (memberResult.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        client = null; // Prevent double release in finally block
        return res.status(404).json({ error: 'Member not found' });
      }

      const member = memberResult.rows[0];

      if (member.payment_status !== 'uploaded') {
        await client.query('ROLLBACK');
        client.release();
        client = null; // Prevent double release in finally block
        return res.status(400).json({
          error: 'Only uploaded payments can be rejected',
          currentStatus: member.payment_status
        });
      }

      // Generate secure upload token (JWT with 30 days expiration for rejection recovery)
      const rejectionToken = jwt.sign(
        {
          memberId: id,
          purpose: 'payment_upload',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days for rejection recovery
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Update member payment status to rejected (shows rejection in UI)
      await client.query(
        `UPDATE members
         SET payment_status = 'rejected',
             payment_rejected_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [id]
      );

      // Log the rejection in audit trail
      await client.query(
        `INSERT INTO payment_audit_log (member_id, admin_id, action, details, ip_address)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          id,
          req.admin.id,
          'payment_rejected',
          `Payment rejected by admin ${req.admin.firstName} ${req.admin.lastName}: ${reviewComment}`,
          req.ip
        ]
      );

      const memberName = `${member.first_name} ${member.last_name}`.trim();
      const memberEmail = member.email;

      await client.query('COMMIT');

      // Log admin audit
      await logAdminAudit(pool, {
        adminId: req.admin.id,
        action: 'reject_payment',
        resourceType: 'member_payment',
        resourceId: id,
        newValues: { payment_status: 'rejected' },
        details: `Rejected payment for member: ${memberName} - Reason: ${reviewComment}`,
        req
      });

      // Log admin activity notification
      await logAdminActivity(client, {
        type: 'payment_rejected',
        title: 'Payment Rejected',
        message: `Payment rejected for member ${memberName}`,
        priority: 'high',
        relatedEntity: 'member',
        relatedId: id,
        adminId: req.admin.id,
        details: {
          memberName: memberName,
          reason: reviewComment
        }
      });

      // Send rejection email to member with upload token
      if (memberEmail) {
        try {
          const emailSent = await sendPaymentRejectedEmail(
            memberEmail,
            memberName,
            req.admin.firstName + ' ' + req.admin.lastName,
            reviewComment,
            rejectionToken // Pass the 30-day upload token for easy re-submission
          );
          if (emailSent) {
            console.log(`📧 Payment rejection email with upload link sent to ${memberEmail}`);
          }
        } catch (emailError) {
          console.error('❌ Failed to send payment rejection email:', emailError.message);
        }
      }

      res.json({
        message: 'Payment rejected and new upload token generated',
        memberName,
        reviewedBy: `${req.admin.firstName} ${req.admin.lastName}`,
        reviewComment,
        rejectionToken, // Secure token for frontend
        tokenExpiry: '30 days'
      });

    } catch (error) {
      if (client) {
        await client.query('ROLLBACK');
      }
      console.error('Error rejecting payment:', error);
      res.status(500).json({ error: 'Failed to reject payment', details: error.message });
    } finally {
      if (client) client.release();
    }
  });

  app.post('/api/admin/renewal-records/:id/verify', authenticateAdminToken, async (req, res) => {
    const { id } = req.params;
    const { reviewComment } = req.body;
    let client;

    try {
      client = await pool.connect();
      await client.query('BEGIN');

      const memberResult = await client.query(
        `SELECT m.id, renewal_status, first_name, last_name, mcd.email
         FROM members m
         LEFT JOIN member_contact_details mcd ON m.id = mcd.member_id
         WHERE m.id = $1`,
        [id]
      );

      if (memberResult.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        client = null; // Prevent double release in finally block
        return res.status(404).json({ error: 'Member not found' });
      }

      const member = memberResult.rows[0];

      if (member.renewal_status !== 'uploaded') {
        await client.query('ROLLBACK');
        client.release();
        client = null; // Prevent double release in finally block
        return res.status(400).json({
          error: 'Only uploaded renewals can be verified',
          currentStatus: member.renewal_status
        });
      }

      await client.query(
        `UPDATE members
         SET renewal_status = 'verified',
             renewal_date = NOW() + INTERVAL '1 year',
             member_status = 'active'
         WHERE id = $1`,
        [id]
      );

      // Log the verification in renewal audit trail
      await client.query(
        `INSERT INTO renewal_audit_log (member_id, admin_id, action, details, ip_address)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          id,
          req.admin.id,
          'renewal_verified',
          `Renewal verified by admin ${req.admin.firstName} ${req.admin.lastName}`,
          req.ip
        ]
      );

      // Insert payment record for renewal payment (P150 annual subscription fee)
      await client.query(
        `INSERT INTO member_payments (member_id, first_name, last_name, amount, fee_type, verified_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          id,
          member.first_name,
          member.last_name,
          150.00, // P150 annual subscription fee
          'renewal_fee',
          req.admin.id
        ]
      );

      const memberName = `${member.first_name} ${member.last_name}`.trim();
      const memberEmail = member.email;

      await client.query('COMMIT');

      // Log admin audit
      await logAdminAudit(pool, {
        adminId: req.admin.id,
        action: 'verify_renewal',
        resourceType: 'member_renewal',
        resourceId: id,
        newValues: { renewal_status: 'verified' },
        details: `Verified renewal for member: ${memberName}`,
        req
      });

      // Log admin activity notification
      await logAdminActivity(client, {
        type: 'renewal_verified',
        title: 'Renewal Verified',
        message: `Renewal verified for member ${memberName}`,
        priority: 'medium',
        relatedEntity: 'member',
        relatedId: id,
        adminId: req.admin.id,
        details: {
          memberName: memberName,
          amount: 150.00,
          feeType: 'renewal_fee'
        }
      });

      if (memberEmail) {
        try {
          await sendRenewalVerifiedEmail(
            memberEmail,
            memberName,
            req.admin.firstName + ' ' + req.admin.lastName,
            reviewComment
          );
        } catch (emailError) {
          console.error('❌ Failed to send renewal verification email:', emailError.message);
        }
      }

      res.json({
        message: 'Renewal verified successfully',
        memberName,
        reviewedBy: `${req.admin.firstName} ${req.admin.lastName}`,
        reviewComment
      });

    } catch (error) {
      if (client) {
        await client.query('ROLLBACK');
      }
      console.error('Error verifying renewal:', error);
      res.status(500).json({ error: 'Failed to verify renewal', details: error.message });
    } finally {
      if (client) client.release();
    }
  });

  app.post('/api/admin/renewal-records/:id/reject', authenticateAdminToken, async (req, res) => {
    const { id } = req.params;
    const { reviewComment } = req.body;
    let client;

    if (!reviewComment || reviewComment.trim().length === 0) {
      return res.status(400).json({ error: 'Review comment is required for rejection' });
    }

    try {
      client = await pool.connect();
      await client.query('BEGIN');

      const memberResult = await client.query(
        `SELECT m.id, renewal_status, first_name, last_name, mcd.email
         FROM members m
         LEFT JOIN member_contact_details mcd ON m.id = mcd.member_id
         WHERE m.id = $1`,
        [id]
      );

      if (memberResult.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        client = null; // Prevent double release in finally block
        return res.status(404).json({ error: 'Member not found' });
      }

      const member = memberResult.rows[0];

      if (member.renewal_status !== 'uploaded') {
        await client.query('ROLLBACK');
        client.release();
        client = null; // Prevent double release in finally block
        return res.status(400).json({
          error: 'Only uploaded renewals can be rejected',
          currentStatus: member.renewal_status
        });
      }

      const renewalToken = jwt.sign(
        {
          memberId: id,
          purpose: 'renewal_upload',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      await client.query(
        `UPDATE members
         SET renewal_status = 'rejected',
             renewal_token = $2,
             renewal_token_expires_at = $3
         WHERE id = $1`,
        [id, renewalToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
      );

      const memberName = `${member.first_name} ${member.last_name}`.trim();
      const memberEmail = member.email;

      await client.query('COMMIT');

      // Log admin audit
      await logAdminAudit(pool, {
        adminId: req.admin.id,
        action: 'reject_renewal',
        resourceType: 'member_renewal',
        resourceId: id,
        newValues: { renewal_status: 'rejected' },
        details: `Rejected renewal for member: ${memberName} - Reason: ${reviewComment}`,
        req
      });

      // Log admin activity notification
      await logAdminActivity(client, {
        type: 'renewal_rejected',
        title: 'Renewal Rejected',
        message: `Renewal rejected for member ${memberName}`,
        priority: 'high',
        relatedEntity: 'member',
        relatedId: id,
        adminId: req.admin.id,
        details: {
          memberName: memberName,
          reason: reviewComment
        }
      });

      if (memberEmail) {
        try {
          await sendRenewalRejectedEmail(
            memberEmail,
            memberName,
            req.admin.firstName + ' ' + req.admin.lastName,
            reviewComment,
            renewalToken
          );
        } catch (emailError) {
          console.error('❌ Failed to send renewal rejection email:', emailError.message);
        }
      }

      res.json({
        message: 'Renewal rejected and new upload token generated',
        memberName,
        reviewedBy: `${req.admin.firstName} ${req.admin.lastName}`,
        reviewComment,
        renewalToken,
        tokenExpiry: '30 days'
      });

    } catch (error) {
      if (client) {
        await client.query('ROLLBACK');
      }
      console.error('Error rejecting renewal:', error);
      res.status(500).json({ error: 'Failed to reject renewal', details: error.message });
    } finally {
      if (client) client.release();
    }
  });

  // Get all payment records (admin only)
  app.get('/api/admin/payments', authenticateAdminToken, async (req, res) => {
    try {
      const { fee_type, page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const client = await pool.connect();

      let query = `
        SELECT 
          mp.id,
          mp.member_id,
          mp.first_name,
          mp.last_name,
          mp.amount,
          mp.fee_type,
          mp.payment_date,
          mp.verified_by,
          mp.created_at,
          a.first_name as admin_first_name,
          a.last_name as admin_last_name
        FROM member_payments mp
        LEFT JOIN admins a ON mp.verified_by = a.id
      `;

      const queryParams = [];
      let paramIndex = 1;

      if (fee_type && fee_type !== 'all') {
        query += ` WHERE mp.fee_type = $${paramIndex}`;
        queryParams.push(fee_type);
        paramIndex++;
      }

      query += ` ORDER BY mp.payment_date DESC`;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(parseInt(limit), offset);

      const result = await client.query(query, queryParams);

      // Get total count for pagination
      let countQuery = `SELECT COUNT(*) FROM member_payments`;
      const countParams = [];
      if (fee_type && fee_type !== 'all') {
        countQuery += ` WHERE fee_type = $1`;
        countParams.push(fee_type);
      }
      const countResult = await client.query(countQuery, countParams);
      const totalRecords = parseInt(countResult.rows[0].count);

      // Get totals by fee type
      const totalsResult = await client.query(`
        SELECT 
          fee_type,
          COUNT(*) as count,
          SUM(amount) as total_amount
        FROM member_payments
        GROUP BY fee_type
      `);

      client.release();

      const payments = result.rows.map(row => ({
        id: row.id,
        memberId: row.member_id,
        firstName: row.first_name,
        lastName: row.last_name,
        amount: parseFloat(row.amount),
        feeType: row.fee_type,
        paymentDate: row.payment_date,
        verifiedBy: row.admin_first_name
          ? `${row.admin_first_name} ${row.admin_last_name}`.trim()
          : 'Unknown',
        createdAt: row.created_at
      }));

      const totals = {};
      totalsResult.rows.forEach(row => {
        totals[row.fee_type] = {
          count: parseInt(row.count),
          totalAmount: parseFloat(row.total_amount)
        };
      });

      res.json({
        payments,
        totals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalRecords,
          totalPages: Math.ceil(totalRecords / limit)
        }
      });

    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ error: 'Failed to fetch payments', details: error.message });
    }
  });
}
