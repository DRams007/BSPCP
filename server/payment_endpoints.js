import jwt from 'jsonwebtoken';

// =========================================
// PAYMENT MANAGEMENT ENDPOINTS
// =========================================

// Import email functions
import { sendPaymentRequestEmail, sendPaymentVerifiedEmail, sendPaymentRejectedEmail } from './lib/emailService.js';

// Request payment from pending/under_review members (admin only)
export function setupPaymentEndpoints(app, authenticateToken, authenticateAdminToken, pool, JWT_SECRET, getFullUrl, sendEmail) {
  app.post('/api/admin/request-payment/:memberId', authenticateAdminToken, async (req, res) => {
    const { memberId } = req.params;
    let client;

    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // Check if member exists and is approved
      const memberResult = await client.query(
        `SELECT id, first_name, last_name, application_status, payment_status, bspcp_membership_number, membership_type
         FROM members
         WHERE id = $1`,
        [memberId]
      );

      if (memberResult.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        client = null; // Mark as released to prevent double release in finally
        return res.status(404).json({ error: 'Member not found' });
      }

      const member = memberResult.rows[0];

      if (!['pending', 'under_review'].includes(member.application_status)) {
        await client.query('ROLLBACK');
        client.release();
        client = null; // Mark as released to prevent double release in finally
        return res.status(400).json({ error: 'Payment can only be requested for pending/under review applications.' });
      }

      // Allow multiple payment requests - status can be 'not_requested' or 'requested'
      // This allows admins to send reminders if needed

      // Generate secure upload token (JWT with expiration)
      const uploadToken = jwt.sign(
        {
          memberId: memberId,
          purpose: 'payment_upload',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Update member payment status and increment request count
      await client.query(
        `UPDATE members
         SET payment_status = 'requested',
             payment_requested_at = CURRENT_TIMESTAMP,
             payment_request_count = COALESCE(payment_request_count, 0) + 1
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

      // Get member's email for notification
      const emailResult = await client.query(
        `SELECT email FROM member_contact_details WHERE member_id = $1`,
        [memberId]
      );

      const memberEmail = emailResult.rows[0]?.email;
      const memberFullName = `${member.first_name} ${member.last_name}`.trim();

      await client.query('COMMIT');

      // Send payment request email
      if (memberEmail) {
        try {
          const emailSent = await sendPaymentRequestEmail(
            memberEmail,
            memberFullName,
            member.membership_type,
            uploadToken
          );
          if (emailSent) {
            console.log(`📧 Payment request email sent to ${memberEmail}`);
          }
        } catch (emailError) {
          console.error('❌ Failed to send payment request email:', emailError.message);
        }
      }

      res.json({
        message: 'Payment request sent successfully',
        member: memberFullName,
        uploadToken, // Secure token for frontend
        expiry: '7 days'
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
        `SELECT id, first_name, last_name, application_status, payment_status
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

      const memberName = `${member.first_name} ${member.last_name}`.trim();
      const memberEmail = member.email;

      await client.query('COMMIT');

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
}
