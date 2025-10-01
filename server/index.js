import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import archiver from 'archiver';
import crypto from 'crypto';
import pool from './lib/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendMemberPasswordResetEmail, sendMemberApprovalEmail, sendApplicationNotificationEmail, sendCounsellorBookingNotificationEmail, sendApplicantRequestMoreInfoEmail } from './lib/emailService.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
    }
  },
});

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // Use environment variable for production

// Save backup directory path for static serving
const backupDir = path.join(__dirname, 'backup');

// Ensure backup directory exists
fs.mkdir(backupDir, { recursive: true }).catch(err => console.warn('Could not create backup directory:', err.message));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadDir));
// Helper to construct full URL
const getFullUrl = (filePath, req) => {
  if (!filePath) return null;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  // Normalize file path to use forward slashes for consistency
  const normalizedPath = filePath.replace(/\\/g, '/');

  // Always extract the filename and serve from the /uploads endpoint
  const filename = path.basename(normalizedPath);
  return `${baseUrl}/uploads/${filename}`;
};

app.get('/api/db-test', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.json({ message: `Database connected successfully! Current time from DB: ${result.rows[0].now}` });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ error: `Failed to connect to database: ${err.message}` });
  }
});

app.post('/api/membership', upload.fields([
  { name: 'idDocument', maxCount: 1 },
  { name: 'proofOfPayment', maxCount: 1 },
  { name: 'certificates', maxCount: 10 },
  { name: 'profileImage', maxCount: 1 } // Added for profile image upload
]), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      // Membership type
      membershipType = 'professional',

      // From members table
      firstName, lastName, bspcpMembershipNumber, idNumber, dateOfBirth, gender, nationality,

      // Student-specific fields
      institutionName, studyYear, counsellingCoursework,
      internshipSupervisorName, internshipSupervisorLicense, internshipSupervisorContact,
      supervisedPracticeHours,

      // From member_professional_details table
      occupation, organizationName, highestQualification, otherQualifications,
      scholarlyPublications, specializations, employmentStatus, yearsExperience,
      bio, title, languages, sessionTypes, feeRange, availability,

    // From member_contact_details table
    phone, email, website, physicalAddress, city,
    emergencyContact, emergencyPhone, showEmail, showPhone, showAddress
    } = req.body;

    console.log('Received gender:', gender);
    console.log('Received dateOfBirth:', dateOfBirth);

    // Calculate full_name for storage
    const calculatedFullName = `${firstName} ${lastName}`.trim();

    // 1. Insert into members table (ALL types get created_at timestamp)
    const memberQuery = membershipType === 'student' ?
      `INSERT INTO members (
        first_name, last_name, full_name, bspcp_membership_number, id_number, date_of_birth, gender, nationality,
        institution_name, study_year, counselling_coursework, internship_supervisor_name, internship_supervisor_contact,
        cpd_document, cpd_points, membership_type, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
      RETURNING id` :
      `INSERT INTO members (
        first_name, last_name, full_name, bspcp_membership_number, id_number, date_of_birth, gender, nationality, cpd_document, cpd_points, membership_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id`;

    const memberParams = membershipType === 'student' ?
      [firstName, lastName, calculatedFullName, bspcpMembershipNumber, idNumber, dateOfBirth, gender, nationality,
       institutionName || null, studyYear || null, counsellingCoursework || null,
       internshipSupervisorName || null, internshipSupervisorContact || null,
       req.body.cpdDocument || null, parseInt(req.body.cpdPoints, 10) || 0, membershipType] :
      [firstName, lastName, calculatedFullName, bspcpMembershipNumber, idNumber, dateOfBirth, gender, nationality,
       req.body.cpdDocument || null, parseInt(req.body.cpdPoints, 10) || 0, membershipType];

    const memberResult = await client.query(memberQuery, memberParams);
    const memberId = memberResult.rows[0].id;

    // 2. Insert into member_professional_details table
    // For students, set some fields to 'Student' or defaults, and use student-specific data where applicable
    let effectiveOccupation = occupation;
    let effectiveOrganizationName = organizationName;
    let effectiveEmploymentStatus = employmentStatus;
    let effectiveYearsExperience = yearsExperience;

    if (membershipType === 'student') {
      effectiveOccupation = occupation || 'Student Counsellor';
      effectiveOrganizationName = organizationName || institutionName || 'Student Training Program';
      effectiveEmploymentStatus = 'student';
      effectiveYearsExperience = yearsExperience || '0';
    }

    await client.query(
      `INSERT INTO member_professional_details (
        member_id, occupation, organization_name, highest_qualification, other_qualifications,
        scholarly_publications, specializations, employment_status, years_experience,
        bio, title, languages, session_types, fee_range, availability
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        memberId, effectiveOccupation, effectiveOrganizationName, highestQualification, otherQualifications,
        scholarlyPublications, specializations ? JSON.parse(specializations) : [], // Assuming specializations is sent as a JSON string array
        effectiveEmploymentStatus, effectiveYearsExperience, bio, title,
        languages ? JSON.parse(languages) : [], // Assuming languages is sent as a JSON string array
        sessionTypes ? JSON.parse(sessionTypes) : [], // Assuming sessionTypes is sent as a JSON string array
        feeRange, availability
      ]
    );



    // 3. Insert into member_contact_details table
    await client.query(
      `INSERT INTO member_contact_details (
        member_id, phone, email, website, physical_address, city,
        emergency_contact, emergency_phone, show_email, show_phone, show_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        memberId, phone, email, website, physicalAddress, city,
        emergencyContact, emergencyPhone, showEmail, showPhone, showAddress
      ]
    );

    const uploadedFiles = req.files;

    // 4. Insert into member_personal_documents table
    let idDocumentPath = null;
    let profileImagePath = null;
    if (uploadedFiles.idDocument) {
      idDocumentPath = uploadedFiles.idDocument[0].path;
    }
    if (uploadedFiles.profileImage) {
      profileImagePath = uploadedFiles.profileImage[0].path;
    }
    if (idDocumentPath || profileImagePath) {
      await client.query(
        `INSERT INTO member_personal_documents (member_id, id_document_path, profile_image_path)
         VALUES ($1, $2, $3)`,
        [memberId, idDocumentPath, profileImagePath]
      );
    }

    // 5. Insert into member_certificates table
    if (uploadedFiles.certificates) {
      for (const file of uploadedFiles.certificates) {
        await client.query(
          `INSERT INTO member_certificates (member_id, file_path, original_filename)
           VALUES ($1, $2, $3)`,
          [memberId, file.path, file.originalname]
        );
      }
    }

    // 6. Insert into member_payments table
    if (uploadedFiles.proofOfPayment) {
      await client.query(
        `INSERT INTO member_payments (member_id, proof_of_payment_path)
         VALUES ($1, $2)`,
        [memberId, uploadedFiles.proofOfPayment[0].path]
      );
    }

    await client.query('COMMIT');

    // Send notification email to admin after successful submission
    try {
      await sendApplicationNotificationEmail(req.body, memberId);
      console.log('📧 Application notification email sent successfully for member:', memberId);
    } catch (emailError) {
      // Log email error but don't fail the application process
      console.error('❌ Failed to send application notification email:', emailError.message);
      // Still successful - application was processed, just email failed
    }

    res.status(201).json({ message: 'Membership application submitted successfully!', memberId });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error submitting membership application:', error);
    res.status(500).json({ error: 'Failed to submit membership application', details: error.message });
  } finally {
    client.release();
  }
});

// New API endpoint to fetch all membership applications
app.get('/api/applications', async (req, res) => {
  try {
    const client = await pool.connect();
    const { status } = req.query; // Get status from query parameters
    let query = `
      SELECT
        m.id,
        m.first_name,
        m.last_name,
        CONCAT(m.first_name, ' ', m.last_name) AS name,
        mcd.email,
        mcd.phone,
        m.nationality,
        m.membership_type,
        mpd.occupation,
        mpd.organization_name AS organization,
        mpd.highest_qualification AS qualification,
        mpd.years_experience AS experience,
        m.created_at,
        m.application_status,
        m.member_status,
        mpd.specializations,
        mpd.languages,
        mpd.session_types,
        mpd.fee_range,
        mpd.availability,
        m.date_of_birth AS "dateOfBirth",
        m.id_number AS "idNumber",
        mcd.physical_address AS "physicalAddress",
        mcd.postal_address AS "postalAddress",
        (
          SELECT json_agg(json_build_object('name', mc.original_filename, 'uploaded', TRUE, 'url', mc.file_path))
          FROM member_certificates mc
          WHERE mc.member_id = m.id
        ) AS certificates,
        (
          SELECT json_build_object('idDocumentPath', mpd2.id_document_path, 'profileImagePath', mpd2.profile_image_path)
          FROM member_personal_documents mpd2
          WHERE mpd2.member_id = m.id
        ) AS personal_documents,
        (
          SELECT json_agg(json_build_object('title', mc.title, 'points', mc.points, 'path', mc.document_path, 'completion_date', mc.completion_date))
          FROM member_cpd mc
          WHERE mc.member_id = m.id
        ) AS cpd_documents,
        (
          SELECT mp.proof_of_payment_path
          FROM member_payments mp
          WHERE mp.member_id = m.id
        ) AS proof_of_payment_path
      FROM members m
      JOIN member_professional_details mpd ON m.id = mpd.member_id
      JOIN member_contact_details mcd ON m.id = mcd.member_id
    `;
    const queryParams = [];

    if (status) {
      query += ` WHERE m.application_status = $1`;
      queryParams.push(status);
    }

    query += ` ORDER BY m.created_at DESC`;

    const result = await client.query(query, queryParams);

    const applications = result.rows.map(row => {
      const documents = [];

      if (row.personal_documents && row.personal_documents.idDocumentPath) {
        documents.push({ name: "ID Document", uploaded: true, url: getFullUrl(row.personal_documents.idDocumentPath, req) });
      }
      // Exclude Profile Image as per new requirement
      // if (row.personal_documents && row.personal_documents.profileImagePath) {
      //   documents.push({ name: "Profile Image", uploaded: true, url: getFullUrl(row.personal_documents.profileImagePath, req) });
      // }
      if (row.proof_of_payment_path) {
        documents.push({ name: "Proof of Payment", uploaded: true, url: getFullUrl(row.proof_of_payment_path, req) });
      }
      if (row.certificates) {
        const certificateDocs = row.certificates.map(cert => ({
          name: cert.name,
          uploaded: cert.uploaded,
          url: getFullUrl(cert.url, req)
        }));
        documents.push(...certificateDocs);
      }

      return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        nationality: row.nationality,
        membershipType: row.membership_type,
        occupation: row.occupation,
        organization: row.organization,
        qualification: row.qualification,
        experience: row.experience,
        created_at: row.created_at,
        application_status: row.application_status,
        member_status: row.member_status,
        personalInfo: {
          dateOfBirth: row.dateOfBirth,
          idNumber: row.idNumber,
          physicalAddress: row.physicalAddress,
          postalAddress: row.postalAddress,
          membershipNumber: row.bspcp_membership_number,
        },
        documents: documents,
        // Include structured documents for frontend modal
        memberDocuments: {
          idDocument: row.personal_documents && row.personal_documents.idDocumentPath
            ? { name: 'ID Document', url: getFullUrl(row.personal_documents.idDocumentPath, req) }
            : null,
          certificates: row.certificates ? row.certificates.map(cert => ({
            name: cert.name,
            url: getFullUrl(cert.url, req)
          })) : [],
          cpdDocuments: row.cpd_documents ? row.cpd_documents.map(cpd => ({
            title: cpd.title,
            points: cpd.points,
            completion_date: cpd.completion_date,
            url: cpd.path && cpd.path.trim() ? getFullUrl(cpd.path, req) : null
          })) : []
        },
        // Add other fields as needed
      };
    });

    client.release();
    res.json(applications);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ error: 'Failed to fetch applications', details: err.message });
  }
});

// New API endpoint to update application status
app.put('/api/applications/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, reviewComment } = req.body;
  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN'); // Start transaction

    let query;
    let queryParams;

  // Helper function to generate unique username
  async function generateUniqueUsername(client, firstName, lastName) {
    // Clean and prepare names
    const cleanFirst = (firstName || '').trim().toLowerCase().replace(/[^a-zA-Z]/g, '');
    const cleanLast = (lastName || '').trim().toLowerCase().replace(/[^a-zA-Z]/g, '');

    // Strategy 1: firstInitial + lastName (current logic)
    let baseUsername = `${cleanFirst.charAt(0)}${cleanLast}`;

    // If strategy 1 is empty, use first name only
    if (!baseUsername || baseUsername.length < 2) {
      baseUsername = cleanFirst || 'user';
    }

    // Multiple strategies to try
    const strategies = [
      baseUsername,
      `${cleanFirst}${cleanLast.charAt(0)}`, // firstName + lastInitial
      `${cleanFirst}${cleanLast}`, // firstName + lastName
    ];

    // Try each strategy, adding numeric suffix if needed
    for (const strategy of strategies) {
      if (!strategy) continue;

      // Check base version first
      const existingCheck = await client.query(
        'SELECT id FROM member_authentication WHERE username = $1',
        [strategy]
      );

      if (existingCheck.rows.length === 0) {
        return strategy; // Base version is available
      }

      // If base version exists, try numeric suffixes
      for (let suffix = 2; suffix <= 999; suffix++) {
        const candidate = `${strategy}${suffix}`;
        const suffixCheck = await client.query(
          'SELECT id FROM member_authentication WHERE username = $1',
          [candidate]
        );

        if (suffixCheck.rows.length === 0) {
          return candidate; // Found unique username with suffix
        }
      }
    }

    // Final fallback: random suffix based on current timestamp
    const timestamp = Date.now();
    const fallbackUsername = `${baseUsername}${timestamp}`;

    // Ensure even the fallback is unique (very unlikely it wouldn't be)
    const existingFallback = await client.query(
      'SELECT id FROM member_authentication WHERE username = $1',
      [fallbackUsername]
    );

    if (existingFallback.rows.length === 0) {
      return fallbackUsername;
    }

    // Ultimate fallback: add random numbers (should never reach here)
    return `${baseUsername}${Math.random().toString(36).substring(2, 8)}`;
  }

  if (status === 'approved') {
      // Update member status to approved and set member as pending password setup (they need to set their password first)
      query = `UPDATE members SET application_status = $1, member_status = 'pending_password_setup', review_comment = $2 WHERE id = $3 RETURNING *`;
      queryParams = [status, reviewComment, id];
    } else {
      query = `UPDATE members SET application_status = $1, review_comment = $2 WHERE id = $3 RETURNING *`;
      queryParams = [status, reviewComment, id];
    }

    const result = await client.query(query, queryParams);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ error: 'Application not found' });
    }

    const member = result.rows[0];

    // If approved, create authentication record and send setup email
    if (status === 'approved') {
      // Generate membership number if not already present
      let membershipNumber = member.bspcp_membership_number;
      if (!membershipNumber) {
        // Generate membership number: BSPCP + current year + sequential number
        const currentYear = new Date().getFullYear() % 100; // Get last 2 digits of year
        const memberIdForNumber = String(id).padStart(4, '0'); // Pad member ID to 4 digits

        membershipNumber = `BSPCP${currentYear}${memberIdForNumber}`;

        // Update the membership number in the database
        await client.query(
          'UPDATE members SET bspcp_membership_number = $1 WHERE id = $2',
          [membershipNumber, id]
        );

        console.log(`Generated membership number: ${membershipNumber} for member ${id}`);
      }

      // Check if authentication already exists (for re-approvals)
      const existingAuth = await client.query(
        'SELECT * FROM member_authentication WHERE member_id = $1',
        [id]
      );

      // Generate unique username using the new collision-resistant function
      const firstName = member.first_name || '';
      const lastName = member.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const username = await generateUniqueUsername(client, firstName, lastName);

      if (existingAuth.rows.length === 0) {
        // Create new authentication record for new approvals
        await client.query(
          `INSERT INTO member_authentication (member_id, username, password_hash, salt)
           VALUES ($1, $2, NULL, NULL)`,
          [id, username]
        );
        console.log(`Created new authentication record for member ${fullName} with username: ${username}`);
      } else {
        // For re-approvals, update username if it changed and clear any old password
        await client.query(
          `UPDATE member_authentication SET username = $1, password_hash = NULL, salt = NULL
           WHERE member_id = $2`,
          [username, id]
        );
        console.log(`Updated authentication record for re-approved member ${fullName} with username: ${username}`);
      }

      // Get member's email
      const emailResult = await client.query(
        `SELECT email FROM member_contact_details WHERE member_id = $1`,
        [id]
      );

      if (emailResult.rows.length > 0) {
        const memberEmail = emailResult.rows[0].email;
        const setupToken = jwt.sign(
          { memberId: id, purpose: 'password_setup' },
          JWT_SECRET,
          { expiresIn: '24h' } // Setup link expires in 24 hours
        );

        // Send approval email
        try {
          await sendMemberApprovalEmail(memberEmail, fullName, username, setupToken);
          console.log(`📧 Member approval email sent to ${memberEmail} for member ${id}`);
        } catch (emailError) {
          console.error('❌ Failed to send member approval email:', emailError.message);
          // Don't fail the approval process if email fails, but log it
        }
      }
    }

    await client.query('COMMIT'); // Commit transaction

    res.json({
      message: `Application ${id} status updated to ${status}`,
      application: member,
      ...(status === 'approved' && { usernameGenerated: true })
    });

  } catch (err) {
    if (client) {
      await client.query('ROLLBACK'); // Rollback transaction on error
    }
    console.error('Error updating application status:', err);
    res.status(500).json({ error: 'Failed to update application status', details: err.message });
  } finally {
    if (client) client.release();
  }
});

// New API endpoint to delete member application
app.delete('/api/applications/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start transaction

    // Get member details before deletion for logging and file cleanup
    const memberResult = await client.query(
      `SELECT m.first_name, m.last_name, mcd.email,
               mpd_doc.id_document_path, mpd_doc.profile_image_path,
               mph.proof_of_payment_path,
               array_agg(mc.file_path) as certificates
       FROM members m
       LEFT JOIN member_contact_details mcd ON m.id = mcd.member_id
       LEFT JOIN member_personal_documents mpd_doc ON m.id = mpd_doc.member_id
       LEFT JOIN member_payments mph ON m.id = mph.member_id
       LEFT JOIN member_certificates mc ON m.id = mc.member_id
       WHERE m.id = $1
       GROUP BY m.first_name, m.last_name, mcd.email, mpd_doc.id_document_path, mpd_doc.profile_image_path, mph.proof_of_payment_path`,
      [id]
    );

    if (memberResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ error: 'Application not found' });
    }

    const member = memberResult.rows[0];
    const memberName = `${member.first_name || ''} ${member.last_name || ''}`.trim();

    // Delete uploaded files from server
    const filesToDelete = [];

    if (member.id_document_path) filesToDelete.push(member.id_document_path);
    if (member.profile_image_path) filesToDelete.push(member.profile_image_path);
    if (member.proof_of_payment_path) filesToDelete.push(member.proof_of_payment_path);
    if (member.certificates && member.certificates.length > 0) {
      filesToDelete.push(...member.certificates.filter(cert => cert));
    }

    // Delete physical files
    for (const filePath of filesToDelete) {
      if (filePath) {
        const fullPath = path.join(__dirname, filePath);
        try {
          await fs.unlink(fullPath);
          console.log(`Deleted file: ${fullPath}`);
        } catch (fileErr) {
          console.warn(`Failed to delete file ${fullPath}: ${fileErr.message}`);
        }
      }
    }

    // Delete member record and related data (cascade delete)
    const deleteResult = await client.query(
      'DELETE FROM members WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');

    console.log(`=== APPLICATION DELETED ===`);
    console.log(`Member: ${memberName}`);
    console.log(`Email: ${member.email}`);
    console.log(`ID: ${id}`);
    console.log(`Files deleted: ${filesToDelete.length}`);
    console.log('========================');

    res.json({
      message: `Application for ${memberName} has been permanently deleted.`, 
      deletedMember: memberName,
      filesCleaned: filesToDelete.length
    });

  } catch (err) {
    if (client) {
      await client.query('ROLLBACK'); // Rollback transaction on error
    }
    console.error('Error deleting application:', err);
    res.status(500).json({ error: 'Failed to delete application', details: err.message });
  } finally {
    if (client) client.release();
  }
});

// New API endpoint to update member status
app.put('/api/members/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE members SET member_status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    client.release();
    if (result.rows.length > 0) {
      res.json({ message: `Member ${id} status updated to ${status}`, member: result.rows[0] });
    } else {
      res.status(404).json({ error: 'Member not found' });
    }
  } catch (err) {
    console.error('Error updating member status:', err);
    res.status(500).json({ error: 'Failed to update member status', details: err.message });
  }
});

import { sendEmail } from './lib/emailService.js';

// New API endpoint to send emails
app.post('/api/send-email', async (req, res) => {
  const { recipients, subject, body } = req.body;
  try {
    const result = await sendEmail(recipients, subject, body);
    res.status(200).json({
      message: 'Email sent successfully',
      emailResult: {
        accepted: result.accepted,
        rejected: result.rejected,
        envelopeTime: result.envelopeTime,
        messageTime: result.messageTime,
        messageSize: result.messageSize,
        response: result.response
      }
    });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Failed to send email', details: err.message });
  }
});

// New API endpoint to send email to applicant requesting more information
app.post('/api/send-applicant-email', async (req, res) => {
  const { applicantEmail, applicantName, subject, body } = req.body;

  // Validate required fields
  if (!applicantEmail || !applicantName || !subject || !body) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: 'applicantEmail, applicantName, subject, and body are all required'
    });
  }

  try {
    const result = await sendApplicantRequestMoreInfoEmail(applicantEmail, applicantName, subject, body);
    res.status(200).json({
      message: 'Email sent successfully to applicant',
      emailResult: {
        accepted: result.accepted,
        rejected: result.rejected,
        envelopeTime: result.envelopeTime,
        messageTime: result.messageTime,
        messageSize: result.messageSize,
        response: result.response
      }
    });
  } catch (err) {
    console.error('Error sending email to applicant:', err);
    res.status(500).json({
      error: 'Failed to send email to applicant',
      details: err.message
    });
  }
});

app.post('/api/member/login', async (req, res) => {
    const { identifier, password } = req.body;
    console.log('Login attempt for:', identifier);
    try {
      const client = await pool.connect();

      // Determine if identifier looks like email or username
      let authenticationQuery;
      let params;
      let isEmail = identifier.includes('@'); // Simple email detection

      if (isEmail) {
          // Login with email - find the member by email first
        authenticationQuery = `
          SELECT ma.member_id, ma.username, ma.password_hash, ma.salt, CONCAT(m.first_name, ' ', m.last_name) AS full_name, m.member_status, m.application_status
          FROM member_contact_details mcd
          JOIN members m ON mcd.member_id = m.id
          JOIN member_authentication ma ON ma.member_id = m.id
          WHERE mcd.email = $1
        `;
        params = [identifier];
      } else {
        // Login with username - original logic
        authenticationQuery = `
          SELECT ma.member_id, ma.username, ma.password_hash, ma.salt, CONCAT(m.first_name, ' ', m.last_name) AS full_name, m.member_status, m.application_status
          FROM member_authentication ma
          JOIN members m ON ma.member_id = m.id
          WHERE ma.username = $1
        `;
        params = [identifier];
      }

      const result = await client.query(authenticationQuery, params);
      client.release();

      if (result.rows.length === 0) {
        console.log('User not found:', identifier);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];
      console.log('User found:', user.username);
      console.log('Provided password:', password);
      console.log('Stored password hash:', user.password_hash);
      console.log('Stored salt:', user.salt); // Note: bcrypt hash already contains the salt, this is just for inspection
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      console.log('Is password valid (bcrypt.compare result):', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Password comparison failed for user:', identifier);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if application is still pending review
    if (user.application_status === 'pending') {
      console.log('User application still under review:', user.username);
      return res.status(403).json({
        error: 'Application Under Review',
        message: 'Your BSPCP membership application is still under review. You will receive an email notification once approved. Please check back later or contact support if you have any questions.',
        applicationStatus: 'under_review'
      });
    }

    // Check if application was rejected
    if (user.application_status === 'rejected') {
      console.log('Rejected application login attempt:', user.username);
      return res.status(403).json({
        error: 'Application Denied',
        message: 'Your BSPCP membership application was not approved. Please contact the BSPCP administration for further information or submit a new application.',
        applicationStatus: 'rejected'
      });
    }

    // Allow login for both 'active' and 'pending_password_setup' users who are approved
    if (user.member_status !== 'active' && user.member_status !== 'pending_password_setup') {
      return res.status(403).json({
        error: 'Account Access Restricted',
        message: 'Your membership account is not active. Please contact BSPCP support for assistance.',
        accountStatus: 'inactive'
      });
    }

    // If member is in pending_password_setup state, automatically change to active on first successful login
    if (user.member_status === 'pending_password_setup') {
      // Update member status to active since they're successfully logging in
      await client.query(
        `UPDATE members SET member_status = 'active' WHERE id = $1`,
        [user.member_id]
      );
      console.log('Member status automatically changed from pending_password_setup to active for:', user.username);
    }

    const token = jwt.sign(
      { memberId: user.member_id, username: user.username, fullName: user.full_name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      memberId: user.member_id,
      fullName: user.full_name,
      accountActivated: user.member_status === 'pending_password_setup' // Optional flag to show activation message in frontend
    });

  } catch (error) {
    console.error('Error during member login:', error);
    res.status(500).json({ error: 'Failed to log in', details: error.message });
  }
});

// New API endpoint for forgot password
app.post('/api/member/forgot-password', async (req, res) => {
  const { email } = req.body;
  console.log('Forgot password request for email:', email);

  try {
    const client = await pool.connect();

    // Find member by email
    const memberResult = await client.query(
      `SELECT m.id, CONCAT(m.first_name, ' ', m.last_name) AS full_name, mcd.email
       FROM members m
       JOIN member_contact_details mcd ON m.id = mcd.member_id
       WHERE mcd.email = $1`,
      [email]
    );

    if (memberResult.rows.length === 0) {
      // For security, always send a generic success message even if email not found
      client.release();
      return res.status(200).json({ message: 'If an account with that email exists, you will receive a password reset link.' });
    }

    const member = memberResult.rows[0];
    const resetToken = jwt.sign({ memberId: member.id }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

    // Send password reset email
    try {
      await sendMemberPasswordResetEmail(member.email, member.full_name, resetToken);
      console.log(`🔐 Password reset email sent to ${member.email} for member ${member.id}`);
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError.message);
      client.release();
      return res.status(500).json({ error: 'Failed to send password reset email', details: emailError.message });
    }

    client.release();
    res.status(200).json({ message: 'If an account with that email exists, you will receive a password reset link.' });

  } catch (error) {
    console.error('Error during forgot password request:', error);
    res.status(500).json({ error: 'Failed to process forgot password request', details: error.message });
  }
});

// New API endpoint for reset password
app.post('/api/member/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  console.log('🔐 Reset password request received with token:', token ? token.substring(0, 20) + '...' : 'NO_TOKEN');

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }

  const client = await pool.connect();
  try {
    console.log('🔐 Starting password reset transaction...');
    await client.query('BEGIN');

    const decoded = jwt.verify(token, JWT_SECRET);
    const memberId = decoded.memberId;
    console.log('🔐 Token decoded for memberId:', memberId);

    // Check if member exists
    const memberExists = await client.query('SELECT id, first_name, last_name FROM members WHERE id = $1', [memberId]);
    if (memberExists.rows.length === 0) {
      console.log('❌ Member not found for ID:', memberId);
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ error: 'Member not found.' });
    }

    const member = memberExists.rows[0];
    console.log('✅ Member found:', `${member.first_name} ${member.last_name} (ID: ${member.id})`);

    // Check if authentication record exists
    const authCheck = await client.query(
      'SELECT id, username, password_hash IS NOT NULL as has_password FROM member_authentication WHERE member_id = $1',
      [memberId]
    );

    if (authCheck.rows.length === 0) {
      console.log('❌ No authentication record found for member');
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ error: 'Member authentication record not found. Please contact admin.' });
    }

    const authRecord = authCheck.rows[0];
    console.log('🔑 Authentication record found - ID:', authRecord.id, 'Has password:', authRecord.has_password);

    // Hash the new password
    console.log('🔐 Generating new password hash...');
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    console.log('🔐 Password hashing completed - Salt length:', salt.length, 'Hash length:', passwordHash.length);

    // Update the member's password with detailed logging
    console.log('📝 Updating member_authentication table...');
    const updateResult = await client.query(
      `UPDATE member_authentication SET password_hash = $1, salt = $2 WHERE member_id = $3`,
      [passwordHash, salt, memberId]
    );

    console.log('📝 Update result - row count:', updateResult.rowCount);

    if (updateResult.rowCount === 0) {
      console.log('❌ No rows updated - this should not happen if authentication record exists');
      await client.query('ROLLBACK');
      client.release();
      return res.status(500).json({ error: 'Failed to update password - no rows affected.' });
    }

    // Verify the update worked
    const verification = await client.query(
      'SELECT password_hash IS NOT NULL as password_updated FROM member_authentication WHERE member_id = $1',
      [memberId]
    );

    if (verification.rows[0].password_updated) {
      console.log('✅ Password update verified successfully');
      await client.query('COMMIT');
      client.release();
      res.status(200).json({ message: 'Password has been reset successfully.' });
    } else {
      console.log('❌ Password update verification failed');
      await client.query('ROLLBACK');
      client.release();
      res.status(500).json({ error: 'Failed to update password - verification failed.' });
    }

  } catch (error) {
    console.error('❌ Error during reset password request:', error);
    if (client) {
      try {
        await client.query('ROLLBACK');
        console.log('🔄 Transaction rolled back due to error');
      } catch (rollbackError) {
        console.error('❌ Error rolling back transaction:', rollbackError);
      }
      client.release();
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Password reset link has expired.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid password reset link.' });
    }

    // Log the full error for debugging
    console.error('🔥 Detailed error in password reset:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.constraint) console.error('Constraint violated:', error.constraint);

    res.status(500).json({
      error: 'Failed to reset password',
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

// New API endpoint for initial password setup after approval
app.post('/api/member/setup-password', async (req, res) => {
  const { token, password } = req.body;
  console.log('🔐 Password setup request received with token:', token ? token.substring(0, 20) + '...' : 'NO_TOKEN');

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required.' });
  }

  // Validate password strength (basic validation)
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const client = await pool.connect();
  try {
    console.log('🔐 Starting password setup transaction...');
    await client.query('BEGIN');

    // Verify the setup token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.purpose !== 'password_setup') {
      console.log('❌ Invalid setup token purpose');
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json({ error: 'Invalid setup token.' });
    }

    const memberId = decoded.memberId;
    console.log('🔐 Setting up password for memberId:', memberId);

    // Check if member exists and is in pending_password_setup status
    const memberResult = await client.query(
      'SELECT id, first_name, last_name, member_status FROM members WHERE id = $1',
      [memberId]
    );

    if (memberResult.rows.length === 0) {
      console.log('❌ Member not found for ID:', memberId);
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ error: 'Member not found.' });
    }

    const member = memberResult.rows[0];
    const memberFullName = `${member.first_name} ${member.last_name}`.trim();
    console.log('✅ Member found:', memberFullName, 'Status:', member.member_status);

    // Check if already active (password already set)
    if (member.member_status === 'active') {
      console.log('⚠️ Account is already active - should not be in setup mode');
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json({ error: 'Account is already set up. Please login instead.' });
    }

    // Check if still in pending setup
    if (member.member_status !== 'pending_password_setup') {
      console.log('❌ Account is not in pending setup state - current status:', member.member_status);
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json({ error: 'Account is not in password setup state.' });
    }

    // Check if authentication record exists
    const authCheck = await client.query(
      'SELECT id, username FROM member_authentication WHERE member_id = $1',
      [memberId]
    );

    if (authCheck.rows.length === 0) {
      console.log('❌ No authentication record found for member - creating one');
      // This shouldn't happen unless the application status update failed
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ error: 'Member authentication record not found. Please contact admin.' });
    }

    console.log('🔑 Authentication record found - ID:', authCheck.rows[0].id, 'Username:', authCheck.rows[0].username);

    // Hash the password
    console.log('🔐 Generating new password hash...');
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    console.log('🔐 Password hashing completed - Salt length:', salt.length, 'Hash length:', passwordHash.length);

    // Update the authentication record with the password
    console.log('📝 Updating member_authentication table...');
    const updateResult = await client.query(
      `UPDATE member_authentication
       SET password_hash = $1, salt = $2, created_at = CURRENT_TIMESTAMP
       WHERE member_id = $3`,
      [passwordHash, salt, memberId]
    );

    console.log('📝 Password setup update result - row count:', updateResult.rowCount);

    if (updateResult.rowCount === 0) {
      console.log('❌ No rows updated - this should not happen');
      await client.query('ROLLBACK');
      client.release();
      return res.status(500).json({ error: 'Failed to update authentication record.' });
    }

    // Update member status to active
    console.log('📝 Updating member status to active...');
    const statusUpdateResult = await client.query(
      `UPDATE members SET member_status = $1 WHERE id = $2`,
      ['active', memberId]
    );

    console.log('📝 Member status update result - row count:', statusUpdateResult.rowCount);

    // Verify both updates worked
    const verification = await client.query(
      `SELECT
        m.member_status,
        ma.password_hash IS NOT NULL as has_password
       FROM members m
       JOIN member_authentication ma ON ma.member_id = m.id
       WHERE m.id = $1`,
      [memberId]
    );

    if (verification.rows[0].member_status === 'active' && verification.rows[0].has_password) {
      console.log('✅ Password setup verified successfully');
      await client.query('COMMIT');
      client.release();
      console.log('🎉 Password setup completed successfully for member:', memberFullName);
      res.status(200).json({
        message: 'Password has been set successfully! You can now login.',
        memberName: memberFullName
      });
    } else {
      console.log('❌ Password setup verification failed');
      console.log('   Member status:', verification.rows[0].member_status);
      console.log('   Has password:', verification.rows[0].has_password);
      await client.query('ROLLBACK');
      client.release();
      res.status(500).json({ error: 'Failed to complete password setup - verification failed.' });
    }

  } catch (error) {
    console.error('❌ Error during password setup:', error);
    if (client) {
      try {
        await client.query('ROLLBACK');
        console.log('🔄 Transaction rolled back due to error');
      } catch (rollbackError) {
        console.error('❌ Error rolling back transaction:', rollbackError);
      }
      client.release();
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Password setup link has expired. Please contact admin for a new setup link.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid password setup link.' });
    }

    // Log the full error for debugging
    console.error('🔥 Detailed error in password setup:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.constraint) console.error('Constraint violated:', error.constraint);

    res.status(500).json({
      error: 'Failed to set up password',
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No token

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next();
  });
};

app.post('/api/check-email', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email is required for validation' });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const client = await pool.connect();

    // Check if email exists in member_contact_details table (case-insensitive search)
    const result = await client.query(
      'SELECT id FROM member_contact_details WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    client.release();

    const available = result.rows.length === 0;

    res.json({
      available,
      message: available ?
        'Email is available for use' :
        'An account with this email already exists. Please use a different email or login if you already have an account.'
    });

  } catch (error) {
    console.error('Error checking email availability:', error);
    res.status(500).json({ error: 'Failed to validate email availability' });
  }
});

// New API endpoint to check ID number availability for membership applications
app.post('/api/check-id-number', async (req, res) => {
  const { idNumber } = req.body;

  if (!idNumber || !idNumber.trim()) {
    return res.status(400).json({ error: 'ID number is required for validation' });
  }

  // Basic ID number validation - at least 5 characters as per schema
  if (idNumber.trim().length < 5) {
    return res.status(400).json({ error: 'ID/Passport number must be at least 5 characters' });
  }

  try {
    const client = await pool.connect();

    // Check if ID number exists in members table (case-insensitive search)
    const result = await client.query(
      'SELECT id FROM members WHERE LOWER(id_number) = LOWER($1)',
      [idNumber.trim()]
    );

    client.release();

    const available = result.rows.length === 0;

    res.json({
      available,
      message: available ?
        'ID number is available for use' :
        'An application with this ID number already exists. Please verify your ID number or contact support if you believe this is an error.'
    });

  } catch (error) {
    console.error('Error checking ID number availability:', error);
    res.status(500).json({ error: 'Failed to validate ID number availability' });
  }
});

// New API endpoint to check phone number availability for membership applications
app.post('/api/check-phone', async (req, res) => {
  const { phone } = req.body;

  if (!phone || !phone.trim()) {
    return res.status(400).json({ error: 'Phone number is required for validation' });
  }

  // Basic phone number validation - at least 8 characters as per schema
  if (phone.trim().length < 8) {
    return res.status(400).json({ error: 'Phone number must be at least 8 characters' });
  }

  try {
    const client = await pool.connect();

    // Check if phone number exists in member_contact_details table
    const result = await client.query(
      'SELECT member_id FROM member_contact_details WHERE phone = $1',
      [phone.trim()]
    );

    client.release();

    const available = result.rows.length === 0;

    res.json({
      available,
      message: available ?
        'Phone number is available for use' :
        'A membership application with this phone number already exists. Please verify your phone number or contact support if you believe this is an error.'
    });

  } catch (error) {
    console.error('Error checking phone number availability:', error);
    res.status(500).json({ error: 'Failed to validate phone number availability' });
  }
});

// New API endpoint to fetch logged-in member's profile data
app.get('/api/member/profile', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    const memberId = req.user.memberId; // Extracted from JWT

const query = `
  SELECT
    m.id,
    m.first_name,
    m.last_name,
    CONCAT(m.first_name, ' ', m.last_name) AS full_name,
    m.bspcp_membership_number,
    m.id_number,
    m.application_status,
    m.member_status,
    m.created_at,
    m.date_of_birth,
    m.gender,
    m.nationality,
    mcd.email,
    mcd.phone,
    mcd.website,
    mcd.physical_address,
    mcd.city,
    mcd.postal_address,
    mcd.emergency_contact,
    mcd.emergency_phone,
    mcd.show_email,
    mcd.show_phone,
    mcd.show_address,
    mpd.occupation,
    mpd.organization_name,
    mpd.highest_qualification,
    mpd.other_qualifications,
    mpd.scholarly_publications,
    mpd.specializations,
    mpd.employment_status,
    mpd.years_experience,
    mpd.bio,
    mpd.title,
    mpd.languages,
    mpd.session_types,
    mpd.fee_range,
    mpd.availability,
    mpd_doc.profile_image_path
  FROM members m
  JOIN member_contact_details mcd ON m.id = mcd.member_id
  JOIN member_professional_details mpd ON m.id = mpd.member_id
  LEFT JOIN member_personal_documents mpd_doc ON m.id = mpd_doc.member_id
  WHERE m.id = $1
`;

    const result = await client.query(query, [memberId]);
    client.release();

    if (result.rows.length > 0) {
      const memberProfile = result.rows[0];

      if (memberProfile.profile_image_path) {
        memberProfile.profile_photo_url = getFullUrl(memberProfile.profile_image_path, req);
      } else {
        memberProfile.profile_photo_url = '/placeholder.svg'; // Default placeholder if no image
      }

      res.json(memberProfile);
    } else {
      res.status(404).json({ error: 'Member profile not found' });
    }
  } catch (err) {
    console.error('Error fetching member profile:', err);
    res.status(500).json({ error: 'Failed to fetch member profile', details: err.message });
  }
});



// New API endpoint to update member's profile data
app.put('/api/member/profile/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const memberId = req.params.id;
    const {
      first_name, last_name, bspcp_membership_number, id_number, date_of_birth, gender, nationality,
      occupation, organization_name, highest_qualification, other_qualifications,
      scholarly_publications, specializations, employment_status, years_experience,
      bio, title, languages, session_types, fee_range, availability
    } = req.body;

    // Debug logging
    console.log('=== PROFILE UPDATE REQUEST ===');
    console.log('Member ID:', memberId);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('ID Number:', `'${id_number}'`, 'Length:', id_number?.length);
    console.log('Date of Birth:', `'${date_of_birth}'`);
    console.log('First Name:', `'${first_name}'`);
    console.log('Last Name:', `'${last_name}'`);
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    console.log('========================');

    await client.query('BEGIN');

    // Debug: Log each parameter to identify the problematic one
    console.log('=== PARAMETER DEBUGGING ===');
    console.log('1. first_name:', `'${first_name}'`, typeof first_name);
    console.log('2. last_name:', `'${last_name}'`, typeof last_name);
    console.log('3. bspcp_membership_number:', `'${bspcp_membership_number}'`, typeof bspcp_membership_number);
    console.log('4. id_number:', `'${id_number}'`, typeof id_number);
    console.log('5. date_of_birth:', `'${date_of_birth}'`, typeof date_of_birth);
    console.log('6. gender:', `'${gender}'`, typeof gender);
    console.log('7. nationality:', `'${nationality}'`, typeof nationality);
    console.log('8. memberId:', `'${memberId}'`, typeof memberId);
    console.log('===========================');

    // 1. Update members table - Explicit cast ALL parameters to avoid type inference issues
    await client.query(
      `UPDATE members SET
        first_name = $1::text, last_name = $2::text, bspcp_membership_number = $3::text, id_number = $4::text, date_of_birth = $5::date, gender = $6::text, nationality = $7::text,
        full_name = CONCAT($1::text, ' ', $2::text)
      WHERE id = $8::uuid`,
      [first_name, last_name, bspcp_membership_number, id_number, date_of_birth, gender, nationality, memberId]
    );

    // 2. Update member_professional_details table - Explicit cast ALL parameters
    await client.query(
      `UPDATE member_professional_details SET
        occupation = $1::text, organization_name = $2::text, highest_qualification = $3::text, other_qualifications = $4::text,
        scholarly_publications = $5::text, specializations = $6::text[], employment_status = $7::text, years_experience = $8::text,
        bio = $9::text, title = $10::text, languages = $11::text[], session_types = $12::text[], fee_range = $13::text, availability = $14::text
      WHERE member_id = $15::uuid`,
      [
        occupation, organization_name, highest_qualification, other_qualifications,
        scholarly_publications, specializations, employment_status, years_experience,
        bio, title, languages, session_types, fee_range, availability, memberId
      ]
    );

    await client.query('COMMIT');

    // Debug logging after commit
    console.log('=== PROFILE UPDATE SUCCESS ===');
    console.log('Transaction committed successfully');
    console.log('========================');

    res.status(200).json({ message: 'Profile updated successfully!' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating member profile:', error);
    res.status(500).json({ error: 'Failed to update member profile', details: error.message });
  } finally {
    client.release();
  }
});

// New API endpoint to get member's notification preferences
app.get('/api/member/notification-preferences', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    const memberId = req.user.memberId;

    const result = await client.query(
      'SELECT member_id, booking_notifications, created_at, updated_at FROM counsellor_notification_preferences WHERE member_id = $1',
      [memberId]
    );

    client.release();

    if (result.rows.length > 0) {
      const preferences = result.rows[0];
      res.json({
        id: preferences.member_id,
        bookingNotifications: preferences.booking_notifications,
        createdAt: preferences.created_at,
        updatedAt: preferences.updated_at
      });
    } else {
      // Return default preferences if none exist
      res.json({
        id: memberId,
        bookingNotifications: true, // Default to enabled
        createdAt: null,
        updatedAt: null
      });
    }
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
});

// New API endpoint to update member's notification preferences
app.put('/api/member/notification-preferences', authenticateToken, async (req, res) => {
  const { bookingNotifications } = req.body;

  if (typeof bookingNotifications !== 'boolean') {
    return res.status(400).json({ error: 'bookingNotifications must be a boolean value' });
  }

  try {
    const client = await pool.connect();
    const memberId = req.user.memberId;

    // Check if preferences already exist
    const existingResult = await client.query(
      'SELECT member_id FROM counsellor_notification_preferences WHERE member_id = $1',
      [memberId]
    );

    let result;
    if (existingResult.rows.length > 0) {
      // Update existing preferences
      result = await client.query(
        `UPDATE counsellor_notification_preferences
         SET booking_notifications = $1, updated_at = CURRENT_TIMESTAMP
         WHERE member_id = $2
         RETURNING member_id, booking_notifications, updated_at`,
        [bookingNotifications, memberId]
      );
    } else {
      // Create new preferences
      result = await client.query(
        `INSERT INTO counsellor_notification_preferences (member_id, booking_notifications)
         VALUES ($1, $2)
         RETURNING member_id, booking_notifications, created_at, updated_at`,
        [memberId, bookingNotifications]
      );
    }

    client.release();

    const preferences = result.rows[0];
    res.json({
      message: 'Notification preferences updated successfully',
      preferences: {
        id: preferences.member_id,
        bookingNotifications: preferences.booking_notifications,
        createdAt: preferences.created_at,
        updatedAt: preferences.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// New API endpoint to update member's contact details
app.put('/api/member/contact/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const memberId = req.params.id;
    const {
      email, phone, website, physical_address, city, postal_address,
      emergency_contact, emergency_phone, show_email, show_phone, show_address
    } = req.body;

    await client.query('BEGIN');

    // Update member_contact_details table
    await client.query(
      `UPDATE member_contact_details SET
        email = $1, phone = $2, website = $3, physical_address = $4, city = $5, postal_address = $6,
        emergency_contact = $7, emergency_phone = $8, show_email = $9, show_phone = $10, show_address = $11
      WHERE member_id = $12`,
      [
        email, phone, website, physical_address, city, postal_address,
        emergency_contact, emergency_phone, show_email, show_phone, show_address, memberId
      ]
    );

    await client.query('COMMIT');
    res.status(200).json({ message: 'Contact information updated successfully!' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating member contact information:', error);
    res.status(500).json({ error: 'Failed to update member contact information', details: error.message });
  } finally {
    client.release();
  }
});

// New API endpoint to fetch member's CPD records
app.get('/api/member/cpd', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    const memberId = req.user.memberId; // Extracted from JWT

    const query = `
      SELECT
        id,
        title,
        points,
        document_path,
        status,
        completion_date,
        uploaded_at
      FROM member_cpd
      WHERE member_id = $1
      ORDER BY uploaded_at DESC
    `;

    const result = await client.query(query, [memberId]);
    client.release();

    const cpdRecords = result.rows.map(row => {
      return {
        ...row,
        document_url: row.document_path ? getFullUrl(row.document_path, req) : null
      };
    });

    res.json(cpdRecords);
  } catch (err) {
    console.error('Error fetching member CPD records:', err);
    res.status(500).json({ error: 'Failed to fetch CPD records', details: err.message });
  }
});

// New API endpoint to upload CPD evidence
app.post('/api/member/cpd', authenticateToken, upload.single('document'), async (req, res) => {
  const client = await pool.connect();
  try {
    const memberId = req.user.memberId; // Extracted from JWT
    const { title, points, completionDate } = req.body;

    let documentPath = null;
    if (req.file) {
      documentPath = `uploads/${req.file.filename}`;
    }

    const result = await client.query(
      `INSERT INTO member_cpd (
        member_id, title, points, document_path, completion_date
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        memberId,
        title,
        parseInt(points, 10) || 0,
        documentPath,
        completionDate || null
      ]
    );

const cpdRecord = result.rows[0];
    res.status(201).json({
      message: 'CPD evidence uploaded successfully!',
      cpd: cpdRecord
    });

  } catch (error) {
    console.error('Error uploading CPD evidence:', error);
    res.status(500).json({ error: 'Failed to upload CPD evidence', details: error.message });
  } finally {
    client.release();
  }
});

// New API endpoint to delete a CPD record
app.delete('/api/member/cpd/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const memberId = req.user.memberId;

    // Get the document path first for file deletion
    const result = await client.query(
      'SELECT document_path FROM member_cpd WHERE id = $1 AND member_id = $2',
      [id, memberId]
    );

    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'CPD record not found' });
    }

    const documentPath = result.rows[0].document_path;

    // Delete the record from database
    const deleteResult = await client.query(
      'DELETE FROM member_cpd WHERE id = $1 AND member_id = $2 RETURNING id',
      [id, memberId]
    );
    client.release();

    if (deleteResult.rows.length > 0) {
      // Delete the physical file if it exists
      if (documentPath) {
        const fullPath = path.join(__dirname, documentPath);
        fs.unlink(fullPath).catch(err => {
          console.warn('Failed to delete physical file:', err.message);
        });
      }

      res.json({ message: `CPD record ${id} deleted successfully` });
    } else {
      res.status(404).json({ error: 'CPD record not found' });
    }
  } catch (err) {
    console.error('Error deleting CPD record:', err);
    res.status(500).json({ error: 'Failed to delete CPD record', details: err.message });
  }
});

// API endpoint to create new content
app.post('/api/content', upload.single('image'), async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      title,
      type,
      status,
      content,
      author,
      location,
      eventDate,
      eventTime,
      metaDescription,
      tags,
    } = req.body;

    const finalEventTime = eventTime === '' ? null : eventTime;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    let featuredImagePath = null;
    if (req.file) {
      featuredImagePath = req.file.path;
    }

    const result = await client.query(
      `INSERT INTO content (
        title, slug, type, status, content, author, location, event_date,
        event_time, meta_description, tags, featured_image_path
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        title,
        slug,
        type,
        status,
        content,
        author,
        location,
        eventDate,
        finalEventTime,
        metaDescription,
        tags,
        featuredImagePath,
      ]
    );

    res.status(201).json({ message: 'Content created successfully!', content: result.rows[0] });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ error: 'Failed to create content', details: error.message });
  } finally {
    client.release();
  }
});





// New API endpoint to delete content
app.delete('/api/content/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM content WHERE id = $1 RETURNING id`,
      [id]
    );
    client.release();

    if (result.rows.length > 0) {
      res.status(200).json({ message: `Content item ${id} deleted successfully.` });
    } else {
      res.status(404).json({ error: 'Content item not found.' });
    }
  } catch (err) {
    console.error('Error deleting content:', err);
    res.status(500).json({ error: 'Failed to delete content', details: err.message });
  }
});

// API endpoint to fetch all content with optional filters (for admin)
app.get('/api/content', async (req, res) => {
  try {
    const client = await pool.connect();
    const { status, type, search } = req.query;
    let query = 'SELECT * FROM content WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      query += ` AND status = ${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    if (type && type !== 'all') {
      query += ` AND type = ${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }
    if (search) {
      query += ` AND (title ILIKE ${paramIndex} OR content ILIKE ${paramIndex} OR tags ILIKE ${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await client.query(query, queryParams);
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching content:', err);
    res.status(500).json({ error: 'Failed to fetch content', details: err.message });
  }
});

// New API endpoint to fetch all content (for public/general use) - this remains separate for public view
app.get('/api/public-content', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM content WHERE status = \'Published\' ORDER BY created_at DESC');
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching public content:', err);
    res.status(500).json({ error: 'Failed to fetch public content', details: err.message });
  }
});

// New API endpoint to update content status
app.put('/api/content/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'Published' or 'Draft'

  try {
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE content SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    client.release();

    if (result.rows.length > 0) {
      res.json({ message: `Content ${id} status updated to ${status}`, content: result.rows[0] });
    } else {
      res.status(404).json({ error: 'Content not found' });
    }
  } catch (err) {
    console.error('Error updating content status:', err);
    res.status(500).json({ error: 'Failed to update content status', details: err.message });
  }
});

// New API endpoint to fetch content statistics
app.get('/api/content-stats', async (req, res) => {
  try {
    const client = await pool.connect();
    const totalContentResult = await client.query('SELECT COUNT(*) FROM content');
    const publishedContentResult = await client.query('SELECT COUNT(*) FROM content WHERE status = \'Published\'');
    const draftContentResult = await client.query('SELECT COUNT(*) FROM content WHERE status = \'Draft\'');
    client.release();

    res.json({
      total: parseInt(totalContentResult.rows[0].count, 10),
      published: parseInt(publishedContentResult.rows[0].count, 10),
      draft: parseInt(draftContentResult.rows[0].count, 10),
    });
  } catch (err) {
    console.error('Error fetching content statistics:', err);
    res.status(500).json({ error: 'Failed to fetch content statistics', details: err.message });
  }
});

app.post('/api/testimonials', async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, email, role, content, rating, anonymous } = req.body;

    const result = await client.query(
      `INSERT INTO testimonials (name, email, role, content, rating, anonymous, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [name, email, role, content, rating, anonymous]
    );

    res.status(201).json({ message: 'Testimonial submitted successfully!', testimonial: result.rows[0] });
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    res.status(500).json({ error: 'Failed to submit testimonial', details: error.message });
  } finally {
    client.release();
  }
});

// New API endpoint to fetch all testimonials
app.get('/api/testimonials', async (req, res) => {
  try {
    const client = await pool.connect();
    const { status, search } = req.query;
    let query = 'SELECT id, name, email, role, content, rating, anonymous, status, created_at AS submitted_date FROM testimonials WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      query += ` AND status ILIKE $${paramIndex}`; // Fixed: Added $ for PostgreSQL parameter placeholder
      queryParams.push(status);
      paramIndex++;
    }
    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR content ILIKE $${paramIndex + 1} OR role ILIKE $${paramIndex + 2})`;
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      paramIndex += 3;
    }

    query += ' ORDER BY created_at DESC';

    const result = await client.query(query, queryParams);
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching testimonials:', err);
    res.status(500).json({ error: 'Failed to fetch testimonials', details: err.message });
  }
});

// New API endpoint to update testimonial status
app.put('/api/testimonials/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE testimonials SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    client.release();

    if (result.rows.length > 0) {
      res.json({ message: `Testimonial ${id} status updated to ${status}`, testimonial: result.rows[0] });
    } else {
      res.status(404).json({ error: 'Testimonial not found' });
    }
  } catch (err) {
    console.error('Error updating testimonial status:', err);
    res.status(500).json({ error: 'Failed to update testimonial status', details: err.message });
  }
});

// New API endpoint to delete a testimonial
app.delete('/api/testimonials/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM testimonials WHERE id = $1 RETURNING id`,
      [id]
    );
    client.release();

    if (result.rows.length > 0) {
      res.status(200).json({ message: `Testimonial ${id} deleted successfully.` });
    } else {
      res.status(404).json({ error: 'Testimonial not found.' });
    }
  } catch (err) {
    console.error('Error deleting testimonial:', err);
    res.status(500).json({ error: 'Failed to delete testimonial', details: err.message });
  }
});

app.post('/api/member/profile-photo', authenticateToken, upload.single('profileImage'), async (req, res) => {
  const client = await pool.connect();
  try {
    const memberId = req.user.memberId;
    console.log('File upload request received for memberId:', memberId);
    console.log('File details:', req.file);

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const profileImagePath = `uploads/${req.file.filename}`;

    // Check if a record for this member exists in member_personal_documents
    const existingDoc = await client.query(
      `SELECT * FROM member_personal_documents WHERE member_id = $1`,
      [memberId]
    );

    if (existingDoc.rows.length > 0) {
      // Update existing record
      console.log('Updating existing profile photo path');
      await client.query(
        `UPDATE member_personal_documents SET profile_image_path = $1, uploaded_at = CURRENT_TIMESTAMP WHERE member_id = $2`,
        [profileImagePath, memberId]
      );
    } else {
      // Insert new record
      console.log('Inserting new profile photo path');
      await client.query(
        `INSERT INTO member_personal_documents (member_id, profile_image_path) VALUES ($1, $2)`,
        [memberId, profileImagePath]
      );
    }

    // Construct the public URL for the image
    const publicUrl = getFullUrl(profileImagePath, req);
    console.log('Public URL for photo:', publicUrl);

    res.status(200).json({ message: 'Profile photo uploaded successfully!', profile_photo_url: publicUrl });

  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({ error: 'Failed to upload profile photo', details: error.message });
  } finally {
    client.release();
  }
});

// New API endpoint to fetch all approved and active counsellors for public view
app.get('/api/counsellors', async (req, res) => {
  try {
    const client = await pool.connect();
    const { sessionType } = req.query; // Get sessionType from query parameters

    let query = `
      SELECT
        m.id,
        CONCAT(m.first_name, ' ', m.last_name) AS full_name,
        mpd.title,
        mpd.specializations,
        mcd.city,
        mpd_doc.profile_image_path,
        mpd.bio,
        mpd.languages,
        mpd.session_types,
        mpd.years_experience,
        mpd.availability
      FROM members m
      JOIN member_professional_details mpd ON m.id = mpd.member_id
      JOIN member_contact_details mcd ON m.id = mcd.member_id
      LEFT JOIN member_personal_documents mpd_doc ON m.id = mpd_doc.member_id
      WHERE m.application_status = 'approved' AND m.member_status = 'active'
    `;
    const queryParams = [];

    if (sessionType) {
      if (sessionType === 'both') {
        query += ` AND mpd.session_types @> ARRAY['in-person']::text[] AND mpd.session_types @> ARRAY['online']::text[]`;
      } else {
        query += ` AND mpd.session_types @> ARRAY[$1]::text[]`;
        queryParams.push(sessionType);
      }
    }

    query += ` ORDER BY full_name;`;

    console.log('Fetching counsellors with query:', query);
    console.log('Query parameters:', queryParams);

    const result = await client.query(query, queryParams);
    client.release();

    const counsellors = result.rows.map(c => ({
      ...c,
      profile_photo_url: c.profile_image_path ? getFullUrl(c.profile_image_path, req) : '/placeholder.svg'
    }));

    console.log('Filtered counsellors from DB:', counsellors.map(c => ({ id: c.id, full_name: c.full_name, session_types: c.session_types })));

    res.json(counsellors);
  } catch (err) {
    console.error('Error fetching counsellors:', err);
    res.status(500).json({ error: 'Failed to fetch counsellors', details: err.message });
  }
});

// New API endpoint to fetch a single counsellor by ID
app.get('/api/counsellors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    const query = `
      SELECT
        m.id,
        CONCAT(m.first_name, ' ', m.last_name) AS full_name,
        mpd.title,
        mpd.specializations,
        mcd.city,
        mpd_doc.profile_image_path,
        mpd.bio,
        mpd.languages,
        mpd.session_types,
        mpd.years_experience,
        mpd.availability,
        mpd.fee_range,
        mcd.email AS contact_email,
        mcd.phone AS contact_phone,
        mcd.website
      FROM members m
      JOIN member_professional_details mpd ON m.id = mpd.member_id
      JOIN member_contact_details mcd ON m.id = mcd.member_id
      LEFT JOIN member_personal_documents mpd_doc ON m.id = mpd_doc.member_id
      WHERE m.id = $1 AND m.application_status = 'approved' AND m.member_status = 'active';
    `;
    const result = await client.query(query, [id]);
    client.release();

    if (result.rows.length > 0) {
      const counsellor = result.rows[0];
      counsellor.profile_photo_url = counsellor.profile_image_path ? getFullUrl(counsellor.profile_image_path, req) : '/placeholder.svg';
      res.json(counsellor);
    } else {
      res.status(404).json({ error: 'Counsellor not found or not active/approved' });
    }
  } catch (err) {
    console.error('Error fetching single counsellor:', err);
    res.status(500).json({ error: 'Failed to fetch counsellor', details: err.message });
  }
});


// New API endpoint to handle booking submissions
app.post('/api/bookings', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      counsellorId,
      clientName,
      phoneNumber,
      email,
      category,
      needs,
      sessionType,
      supportUrgency,
      bookingDate,
      bookingTime,
    } = req.body;

    // Insert booking record
    const bookingResult = await client.query(
      `INSERT INTO bookings (
        counsellor_id, client_name, phone_number, email, category, needs,
        session_type, support_urgency, booking_date, booking_time, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
      RETURNING *`,
      [
        counsellorId,
        clientName,
        phoneNumber,
        email,
        category,
        needs,
        sessionType,
        supportUrgency,
        bookingDate,
        bookingTime,
      ]
    );

    const bookingData = bookingResult.rows[0];

    // Get counsellor's email and notification preferences
    const counsellorQuery = `
      SELECT
        m.first_name,
        m.last_name,
        CONCAT(m.first_name, ' ', m.last_name) AS full_name,
        mcd.email,
        COALESCE(cnp.booking_notifications, true) AS booking_notifications
      FROM members m
      JOIN member_contact_details mcd ON m.id = mcd.member_id
      LEFT JOIN counsellor_notification_preferences cnp ON m.id = cnp.member_id
      WHERE m.id = $1 AND m.application_status = 'approved' AND m.member_status = 'active'
    `;

    const counsellorResult = await client.query(counsellorQuery, [counsellorId]);

    // Send notification email if counsellor is found and notifications are enabled (default true)
    if (counsellorResult.rows.length > 0) {
      const counsellor = counsellorResult.rows[0];

      if (counsellor.booking_notifications) {
        try {
          await sendCounsellorBookingNotificationEmail(bookingData, counsellor.email, counsellor.full_name);
          console.log('📧 Counsellor booking notification sent successfully for counsellor:', counsellor.email);
        } catch (emailError) {
          // Log email error but don't fail the booking process
          console.error('❌ Failed to send counsellor notification email:', emailError.message);
        }
      } else {
        console.log('📧 Counsellor opted out of booking notifications:', counsellor.email);
      }
    } else {
      console.log('⚠️ Counsellor not found or not active for booking notification');
    }

    res.status(201).json({ message: 'Booking created successfully!' });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking', details: error.message });
  } finally {
    client.release();
  }
});

// New API endpoint to fetch all bookings for a specific counsellor
app.get('/api/member/bookings', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    const counsellorId = req.user.memberId; // Extracted from JWT
    const { status } = req.query; // Optional status filter

    let query = `
      SELECT
        id,
        client_name AS "clientName",
        phone_number AS "clientPhone",
        email AS "clientEmail",
        category AS service,
        needs,
        session_type AS "sessionType",
        support_urgency AS "supportUrgency",
        booking_date AS date,
        booking_time AS time,
        status,
        created_at AS "createdAt"
      FROM bookings
      WHERE counsellor_id = $1
    `;
    const queryParams = [counsellorId];

    if (status && status !== 'all') {
      query += ` AND status = $2`;
      queryParams.push(status);
    }

    query += ` ORDER BY booking_date DESC, booking_time DESC`;

    const result = await client.query(query, queryParams);
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching member bookings:', err);
    res.status(500).json({ error: 'Failed to fetch member bookings', details: err.message });
  }
});

// New API endpoint to update booking status
app.put('/api/bookings/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body; // notes for cancellation reason
  try {
    const client = await pool.connect();
    const counsellorId = req.user.memberId;

    let query = `
      UPDATE bookings
      SET status = $1,
          needs = CASE WHEN $2::text IS NOT NULL THEN needs || E'\n' || $2 ELSE needs END
      WHERE id = $3 AND counsellor_id = $4
      RETURNING *;
    `;
    const result = await client.query(query, [status, notes, id, counsellorId]);
    client.release();

    if (result.rows.length > 0) {
      res.json({ message: `Booking ${id} status updated to ${status}`, booking: result.rows[0] });
    } else {
      res.status(404).json({ error: 'Booking not found or unauthorized' });
    }
  } catch (err) {
    console.error('Error updating booking status:', err);
    res.status(500).json({ error: 'Failed to update booking status', details: err.message });
  }
});

// New API endpoint to reschedule a booking
app.put('/api/bookings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { bookingDate, bookingTime } = req.body;
  let client; // Declare client here
  try {
    client = await pool.connect(); // Assign client here
    const counsellorId = req.user.memberId;

    const result = await client.query(
      `UPDATE bookings
       SET booking_date = $1, booking_time = $2, status = 'rescheduled'
       WHERE id = $3 AND counsellor_id = $4
       RETURNING *;`,
      [bookingDate, bookingTime, id, counsellorId]
    );
    // client.release(); // Removed from here

    if (result.rows.length > 0) {
      res.json({ message: `Booking ${id} rescheduled successfully!`, booking: result.rows[0] });
    } else {
      res.status(404).json({ error: 'Booking not found or unauthorized' });
    }
  } catch (err) {
    console.error('Error rescheduling booking:', err);
    res.status(500).json({ error: 'Failed to reschedule booking', details: err.message });
  } finally {
    if (client) { // Check if client is defined before releasing
      client.release();
    }
  }
});

app.get('/api/admin/dashboard-stats', async (req, res) => {
  try {
    const client = await pool.connect();

    const totalMembersResult = await client.query(
      `SELECT COUNT(*) FROM members WHERE member_status = 'active';`
    );
    const pendingApplicationsResult = await client.query(
      `SELECT COUNT(*) FROM members WHERE application_status = 'pending';`
    );
    const activeNewsResult = await client.query(
      `SELECT COUNT(*) FROM content WHERE type = 'news' AND status = 'Published';`
    );
    const upcomingEventsResult = await client.query(
      `SELECT COUNT(*) FROM content WHERE type = 'event' AND status = 'Published' AND event_date >= NOW();`
    );

    client.release();

    res.json({
      totalMembers: parseInt(totalMembersResult.rows[0].count, 10),
      pendingApplications: parseInt(pendingApplicationsResult.rows[0].count, 10),
      activeNews: parseInt(activeNewsResult.rows[0].count, 10),
      upcomingEvents: parseInt(upcomingEventsResult.rows[0].count, 10),
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// New API endpoint to fetch today's confirmed bookings for a specific counsellor
app.get('/api/member/bookings/today', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    const counsellorId = req.user.memberId; // Extracted from JWT
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    const query = `
      SELECT
        id,
        client_name AS "clientName",
        phone_number AS "clientPhone",
        email AS "clientEmail",
        category AS service,
        needs,
        session_type AS "sessionType",
        support_urgency AS "supportUrgency",
        booking_date AS date,
        booking_time AS time,
        status,
        created_at AS "createdAt"
      FROM bookings
      WHERE counsellor_id = $1
        AND booking_date = $2
        AND status = 'confirmed'
      ORDER BY booking_time ASC;
    `;
    const result = await client.query(query, [counsellorId, today]);
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching today\'s member bookings:', err);
    res.status(500).json({ error: 'Failed to fetch today\'s member bookings', details: err.message });
  }
});

// New API endpoint to fetch counsellor bookings by date
app.get('/api/counsellors/:id/bookings/date', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const client = await pool.connect();
    const query = `
      SELECT
        id,
        client_name AS "clientName",
        phone_number AS "clientPhone",
        email AS "clientEmail",
        category AS service,
        needs,
        session_type AS "sessionType",
        support_urgency AS "supportUrgency",
        booking_date AS date,
        booking_time AS time,
        status,
        created_at AS "createdAt"
      FROM bookings
      WHERE counsellor_id = $1
        AND booking_date = $2
        AND status IN ('confirmed', 'pending')
      ORDER BY booking_time ASC;
    `;
    const result = await client.query(query, [id, date]);
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching counsellor bookings by date:', err);
    res.status(500).json({ error: 'Failed to fetch counsellor bookings by date', details: err.message });
  }
});

// API endpoint to create comprehensive database backup with pg_dump + tar file
app.post('/api/backup', async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, 'uploads');

    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });

    // Generate timestamp for unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
    const backupFilename = `backup_${timestamp}.zip`;
    const backupPath = path.join(backupDir, backupFilename);

    // Create temporary directory for backup components
    const tempBackupDir = path.join(backupDir, `backup_temp_${timestamp}`);

    console.log('Creating backup directory structure...');
    await fs.mkdir(tempBackupDir, { recursive: true });

    // Create database subdirectory
    const dbBackupDir = path.join(tempBackupDir, 'database');
    await fs.mkdir(dbBackupDir, { recursive: true });

    // Define backup file paths with clean naming
    const dumpFilePath = path.join(dbBackupDir, `BSPCP_backup.dump`);
    const bakFilePath = path.join(dbBackupDir, `BSPCP_backup.bak`);
    const sqlFilePath = path.join(dbBackupDir, `BSPCP_backup.sql`);
    const tarFilePath = path.join(tempBackupDir, `uploads.tar.gz`);

    console.log('Creating PostgreSQL .dump file (custom format)...');
    // 1. Create custom format pg_dump (compressed binary format) as .dump
    const dumpPgDumpCommand = `pg_dump -Fc -Z 9 --compress=zstd:19 --no-privileges --no-owner -h localhost -U postgres -d BSPCP -f "${dumpFilePath}"`;

    await promisify(exec)(dumpPgDumpCommand, {
      env: { ...process.env, PGPASSWORD: 'botshub' }
    });
    console.log('BSPCP_backup.dump created successfully');

    console.log('Creating PostgreSQL .bak file (SQL format)...');
    // 2. Create traditional SQL pg_dump (human-readable) as .bak
    const bakPgDumpCommand = `pg_dump --no-privileges --no-owner -h localhost -U postgres -d BSPCP > "${bakFilePath}"`;

    await promisify(exec)(bakPgDumpCommand, {
      env: { ...process.env, PGPASSWORD: 'botshub' }
    });
    console.log('BSPCP_backup.bak created successfully');

    console.log('Creating PostgreSQL .sql file (SQL format)...');
    // 3. Create additional SQL format pg_dump (human-readable) as .sql
    const sqlPgDumpCommand = `pg_dump --no-privileges --no-owner -h localhost -U postgres -d BSPCP > "${sqlFilePath}"`;

    await promisify(exec)(sqlPgDumpCommand, {
      env: { ...process.env, PGPASSWORD: 'botshub' }
    });
    console.log('BSPCP_backup.sql created successfully');

    console.log('Creating tar archive of user files...');
    // 4. Create tar archive of uploads directory
    const tarCommand = `tar -czf "${tarFilePath}" -C "${uploadDir}" .`;

    await promisify(exec)(tarCommand);
    console.log('Tar file created successfully');

    // 4. Create backup manifest
    const manifest = {
      backupInfo: {
        timestamp: new Date().toISOString(),
        type: 'dual_backup',
        pg_dump: 'dual_database_formats',
        tarFile: 'user_uploads',
        createdBy: 'BSPCP_admin',
        version: '1.0'
      },
      files: [
        {
          type: 'dump_file',
          name: path.basename(dumpFilePath),
          description: 'PostgreSQL custom format backup (.dump) - compressed, fast restoration',
          restoreCommand: `pg_restore -h localhost -U postgres -d BSPCP "${dumpFilePath}"`
        },
        {
          type: 'bak_file',
          name: path.basename(bakFilePath),
          description: 'PostgreSQL SQL dump (.bak) - human-readable database backup',
          restoreCommand: `psql -h localhost -U postgres -d BSPCP < "${bakFilePath}"`
        },
        {
          type: 'sql_file',
          name: path.basename(sqlFilePath),
          description: 'PostgreSQL SQL dump (.sql) - standard SQL format database backup',
          restoreCommand: `psql -h localhost -U postgres -d BSPCP < "${sqlFilePath}"`
        },
        {
          type: 'user_files',
          name: path.basename(tarFilePath),
          description: 'User uploads compressed archive',
          restoreCommand: `tar -xf "${tarFilePath}" -C server/uploads/`
        }
      ],
      instructions: {
        setup: [
          '1. Extract the backup zip file',
          '2. Create a new database if needed (USE: createdb -h localhost -U postgres BSPCP)',
          '3. Choose restoration method below',
          '4. Extract user files to server/uploads directory'
        ],
        restorationMethods: {
          'Complete Fresh Restore (Clean Database)': [
            'Option 1 - Drop existing database and restore fresh',
            'Step 1: Drop existing database (if exists)',
            `dropdb -h localhost -U postgres BSPCP`,
            'Step 2: Create fresh database',
            `createdb -h localhost -U postgres BSPCP`,
            'Step 3: Restore from backup (choose one)',
            `pg_restore -h localhost -U postgres -d BSPCP "${path.basename(dumpFilePath)}"`, 
            'OR',
            `psql -h localhost -U postgres -d BSPCP < "${path.basename(bakFilePath)}"`, 
            'OR',
            `psql -h localhost -U postgres -d BSPCP < "${path.basename(sqlFilePath)}"`, 
            '▶ BEST for development/staging environments'
          ],
          'Force Restore into Existing Database': [
            'Option 2 - Force restore with --clean (removes existing tables)',
            '⚠️ WARNING: This will DROP existing tables first, potentially losing data',
            'Step 1: Verify you have backups of current data',
            'Step 2: Force restore with clean option',
            `pg_restore -h localhost -U postgres -d BSPCP --clean --if-exists "${path.basename(dumpFilePath)}"`, 
            'OR with psql (if current DB has issues)',
            `psql -h localhost -U postgres -d BSPCP < "${path.basename(bakFilePath)}" --variable ON_ERROR_STOP=off`, 
            '▶ USE with CAUTION - backup current data first!'
          ],
          'Safe Side-by-Side Restore': [
            'Option 3 - Create new database copy (safe - no data loss)',
            'Step 1: Create new database with timestamp',
            `createdb -h localhost -U postgres "BSPCP_backup_${new Date().toISOString().split('T')[0]}"`, 
            'Step 2: Restore to the new database',
            `pg_restore -h localhost -U postgres -d "BSPCP_backup_${new Date().toISOString().split('T')[0]}" "${path.basename(dumpFilePath)}"`, 
            'OR',
            `psql -h localhost -U postgres -d "BSPCP_backup_${new Date().toISOString().split('T')[0]}" < "${path.basename(bakFilePath)}"`, 
            'Step 3: Compare databases and merge if needed',
            `psql -h localhost -U postgres -d BSPCP -c "SELECT COUNT(*) FROM members;"`, 
            `psql -h localhost -U postgres -d "BSPCP_backup_${new Date().toISOString().split('T')[0]}" -c "SELECT COUNT(*) FROM members;"`, 
            '▶ SAFEST option - keeps both original and backup data'
          ],
          quickRestoreMethods: {
            'Fast Dump Restore (Recommended)': [
              `pg_restore -h localhost -U postgres -d BSPCP "${path.basename(dumpFilePath)}"`
            ],
            'SQL Text Restore': [
              `psql -h localhost -U postgres -d BSPCP < "${path.basename(bakFilePath)}"`, 
              'OR',
              `psql -h localhost -U postgres -d BSPCP < "${path.basename(sqlFilePath)}"`
            ]
          },
          userFiles: [
            'Restore uploaded files:',
            `tar -xf "${path.basename(tarFilePath)}" -C server/uploads/`
          ]
        }
      }
    };

    const manifestPath = path.join(tempBackupDir, 'backup_manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    console.log('Creating final backup zip...');
    // 5. Start creating the final zip file
    const fsSync = await import('fs');
    const output = fsSync.createWriteStream(backupPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Best compression
    });

    // Handle archive errors
    archive.on('error', (err) => {
      throw err;
    });

    // Wait for the zip to finish
    const zipPromise = new Promise((resolve, reject) => {
      output.on('close', resolve);
      output.on('error', reject);
    });

    output.on('finish', () => {
      console.log('Final backup zip file created successfully');
    });

    // Pipe archive data to the file
    archive.pipe(output);

    // Add the entire temp backup directory to the zip
    archive.directory(tempBackupDir, false);

    await archive.finalize();

    // Wait for zip to finish
    await zipPromise;

    // Clean up temporary directory
    await fs.rm(tempBackupDir, { recursive: true, force: true });

    // Clean up old backups (keep last 7)
    await cleanupOldBackups(backupDir);

    // Generate download URL
    const downloadUrl = `${req.protocol}://${req.get('host')}/backup/${backupFilename}`;

    // Save backup record to database
    const filesize = await getFileSize(backupPath);
    const includes = ['BSPCP_backup.dump', 'BSPCP_backup.bak', 'BSPCP_backup.sql', 'uploads.tar.gz', 'backup_manifest.json'];

    try {
      const client = await pool.connect();
      await client.query(
        `INSERT INTO backup_records (
          filename, filepath, filesize, file_count, backup_type, formats, includes, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          backupFilename,
          backupPath,
          filesize,
          includes.length,
          'comprehensive',
          ['dump', 'bak', 'sql'],
          JSON.stringify(includes),
          'active'
        ]
      );
      client.release();
      console.log('Backup record saved to database successfully!');
    } catch (dbError) {
      console.error('Failed to save backup record to database:', dbError.message);
      // Don't fail the entire backup process if DB insertion fails
    }

    console.log('Backup process completed successfully!');

    res.status(200).json({
      message: 'Comprehensive backup created successfully! (.dump + .bak + .sql + tar files)',
      downloadUrl: downloadUrl,
      filename: backupFilename,
      size: filesize,
      created: new Date().toISOString(),
      backupType: 'triple_database_formats',
      includes: includes
    });

  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup', details: error.message });
  }
});

// New API endpoint to fetch all backup records
app.get('/api/backups', async (req, res) => {
  try {
    const client = await pool.connect();
    const { status } = req.query;

    let query = `
      SELECT
        id,
        filename,
        filepath,
        filesize,
        file_count,
        backup_type,
        formats,
        includes,
        status,
        created_by,
        created_at
      FROM backup_records
    `;
    const queryParams = [];

    if (status && status !== 'all') {
      query += ' WHERE status = $1';
      queryParams.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await client.query(query, queryParams);
    client.release();

    // Format file sizes for display
    const backups = result.rows.map(backup => {
      let includes_parsed = [];
      try {
        // Handle both JSON strings and plain text arrays
        if (backup.includes) {
          // Check if it's a JSON string
          if (backup.includes.startsWith('[') && backup.includes.endsWith(']')) {
            includes_parsed = JSON.parse(backup.includes);
          } else if (typeof backup.includes === 'string') {
            // Handle plain text like "file1, file2, file3"
            includes_parsed = backup.includes.split(',').map(item => item.trim());
          }
        }
      } catch (parseError) {
        console.warn(`Failed to parse includes for backup ${backup.id}:`, parseError.message);
        // Fallback: convert to array or use empty array
        includes_parsed = [];
      }

      return {
        ...backup,
        filesize_formatted: formatFileSize(backup.filesize),
        includes_parsed: includes_parsed,
        created_at_formatted: new Date(backup.created_at).toLocaleString(),
        download_url: `${req.protocol}://${req.get('host')}/backup/${backup.filename}`
      };
    });

    res.json(backups);
  } catch (err) {
    console.error('Error fetching backups:', err);
    res.status(500).json({ error: 'Failed to fetch backups', details: err.message });
  }
});

// New API endpoint to download specific backup
app.get('/api/backups/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();

    const result = await client.query(
      'SELECT filename, filepath FROM backup_records WHERE id = $1 AND status = $2',
      [id, 'active']
    );
    client.release();

    if (result.rows.length > 0) {
      const { filename, filepath } = result.rows[0];

      // Check if file exists
      const fs = await import('fs');
      if (fs.existsSync(filepath)) {
        res.download(filepath, filename);
      } else {
        res.status(404).json({ error: 'Backup file not found on filesystem' });
      }
    } else {
      res.status(404).json({ error: 'Backup not found in database' });
    }
  } catch (err) {
    console.error('Error downloading backup:', err);
    res.status(500).json({ error: 'Failed to download backup', details: err.message });
  }
});

// New API endpoint to delete backup record (soft delete)
app.put('/api/backups/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();

    const result = await client.query(
      'UPDATE backup_records SET status = $1, deleted_at = $2 WHERE id = $3 AND status = $4 RETURNING *',
      ['deleted', new Date().toISOString(), id, 'active']
    );
    client.release();

    if (result.rows.length > 0) {
      res.json({ message: `Backup ${id} marked as deleted successfully` });
    } else {
      res.status(404).json({ error: 'Backup not found or already deleted' });
    }
  } catch (err) {
    console.error('Error deleting backup:', err);
    res.status(500).json({ error: 'Failed to delete backup', details: err.message });
  }
});

// New API endpoint to restore backup record (undelete)
app.put('/api/backups/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();

    const result = await client.query(
      'UPDATE backup_records SET status = $1, deleted_at = $2 WHERE id = $3 AND status = $4 RETURNING *',
      ['active', null, id, 'deleted']
    );
    client.release();

    if (result.rows.length > 0) {
      res.json({ message: `Backup ${id} restored successfully` });
    } else {
      res.status(404).json({ error: 'Backup not found or not deleted' });
    }
  } catch (err) {
    console.error('Error restoring backup:', err);
    res.status(500).json({ error: 'Failed to restore backup', details: err.message });
  }
});

// New API endpoint to get backup statistics
app.get('/api/backups/stats', async (req, res) => {
  try {
    const client = await pool.connect();

    const [totalBackups, activeBackups, deletedBackups, totalSize] = await Promise.all([
      client.query('SELECT COUNT(*) FROM backup_records'),
      client.query('SELECT COUNT(*) FROM backup_records WHERE status = $1', ['active']),
      client.query('SELECT COUNT(*) FROM backup_records WHERE status = $1', ['deleted']),
      client.query('SELECT SUM(filesize) FROM backup_records WHERE status = $1', ['active'])
    ]);

    client.release();

    res.json({
      total_backups: parseInt(totalBackups.rows[0].count, 10),
      active_backups: parseInt(activeBackups.rows[0].count, 10),
      deleted_backups: parseInt(deletedBackups.rows[0].count, 10),
      total_size_bytes: parseInt(totalSize.rows[0].sum || 0, 10),
      total_size_formatted: formatFileSize(parseInt(totalSize.rows[0].sum || 0, 10))
    });
  } catch (err) {
    console.error('Error fetching backup statistics:', err);
    res.status(500).json({ error: 'Failed to fetch backup statistics', details: err.message });
  }
});

// Helper function to format file sizes
function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Serve backup files
app.use('/backup', express.static(backupDir));

// Helper function to clean up old backups (keep last 7)
async function cleanupOldBackups(backupDir) {
  try {
    const files = await fs.readdir(backupDir);
    const backupFiles = files
      .filter(f => f.startsWith('backup_') && f.endsWith('.zip'))
      .map(f => ({
        name: f,
        path: path.join(backupDir, f),
        stat: null
      }));

    // Get file stats
    for (const file of backupFiles) {
      try {
        file.stat = await fs.stat(file.path);
      } catch (err) {
        console.warn(`Could not stat file ${file.name}:`, err.message);
      }
    }

    // Sort by modification time (newest first)
    backupFiles.sort((a, b) => (b.stat?.mtime || 0) - (a.stat?.mtime || 0));

    // Remove files beyond the last 7
    if (backupFiles.length > 7) {
      const filesToDelete = backupFiles.slice(7);
      for (const file of filesToDelete) {
        try {
          await fs.unlink(file.path);
          console.log(`Cleaned up old backup: ${file.name}`);
        } catch (err) {
          console.warn(`Could not delete old backup ${file.name}:`, err.message);
        }
      }
    }
  } catch (error) {
    console.warn('Error cleaning up old backups:', error.message);
  }
}

// Helper function to get file size
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

// =========================================
// ADMIN AUTHENTICATION ENDPOINTS
// =========================================

// Admin JWT authentication middleware
const authenticateAdminToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Return JSON error instead of HTML status codes
  if (token == null) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    let client;
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });

    try {
      // Verify admin still exists and is active
      client = await pool.connect();
      const adminResult = await client.query(
        'SELECT id, is_active, role FROM admins WHERE id = $1',
        [decoded.adminId]
      );

      if (adminResult.rows.length === 0) {
        client.release();
        return res.status(401).json({ error: 'Admin account not found' });
      }

      const admin = adminResult.rows[0];
      if (!admin.is_active) {
        client.release();
        return res.status(403).json({ error: 'Admin account is deactivated' });
      }

      // Check if token is blacklisted (logout scenario)
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const sessionResult = await client.query(
        'SELECT id FROM admin_sessions WHERE admin_id = $1 AND token_hash = $2',
        [admin.id, tokenHash]
      );

      client.release();
      client = null;

      if (sessionResult.rows.length === 0) {
        return res.status(401).json({ error: 'Token has been invalidated' });
      }

      req.admin = {
        id: admin.id,
        role: admin.role,
        ...decoded
      };
      next();
    } catch (dbError) {
      if (client) {
        client.release();
      }
      console.error('Admin token verification error:', dbError);
      res.status(500).json({ error: 'Authentication service unavailable', details: dbError.message });
    }
  });
};

// Role-based permissions middleware
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.admin || !req.admin.role) {
      return res.status(403).json({ error: 'Admin authentication required' });
    }

    const roleHierarchy = {
      'admin': 1,
      'super_admin': 2
    };

    if (roleHierarchy[req.admin.role] < roleHierarchy[requiredRole]) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: requiredRole,
        current: req.admin.role
      });
    }

    next();
  };
};

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const client = await pool.connect();

    // Find admin by username or email
    const adminResult = await client.query(
      `SELECT id, username, email, password_hash, salt, role, first_name, last_name,
               is_active, login_attempts, locked_until
       FROM admins
       WHERE (username = $1 OR email = $1) AND is_active = true`,
      [identifier]
    );

    if (adminResult.rows.length === 0) {
      client.release();
      console.log(`Failed login attempt for: ${identifier}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = adminResult.rows[0];

    // Check if account is locked
    if (admin.locked_until && new Date() < new Date(admin.locked_until)) {
      client.release();
      return res.status(429).json({
        error: 'Account is temporarily locked',
        retryAfter: new Date(admin.locked_until).toISOString()
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      // Increment login attempts
      const newAttempts = admin.login_attempts + 1;
      let updateQuery = 'UPDATE admins SET login_attempts = $1 WHERE id = $2';
      let updateParams = [newAttempts, admin.id];

      // Lock account if too many failed attempts
      if (newAttempts >= 5) {
        const lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        updateQuery = 'UPDATE admins SET login_attempts = $1, locked_until = $2 WHERE id = $3';
        updateParams = [newAttempts, lockUntil, admin.id];
      }

      await client.query(updateQuery, updateParams);
      client.release();

      console.log(`Invalid password for admin: ${admin.username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Successful login - reset login attempts and update last login
    await client.query(
      'UPDATE admins SET login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = $1',
      [admin.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        firstName: admin.first_name,
        lastName: admin.last_name
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Store session in database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await client.query(
      `INSERT INTO admin_sessions (admin_id, token_hash, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [admin.id, tokenHash, new Date(Date.now() + 2 * 60 * 60 * 1000), req.ip, req.get('User-Agent')]
    );

    client.release();

    // Log successful login
    console.log('=== ADMIN LOGIN SUCCESS ===');
    console.log(`User: ${admin.username} (${admin.role})`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`IP: ${req.ip}`);
    console.log('==========================');

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        firstName: admin.first_name,
        lastName: admin.last_name
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Authentication service unavailable' });
  }
});

// Admin logout endpoint
app.post('/api/admin/logout', authenticateAdminToken, async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader.split(' ')[1];
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const client = await pool.connect();

    // Remove session from database (invalidate token)
    await client.query(
      'DELETE FROM admin_sessions WHERE admin_id = $1 AND token_hash = $2',
      [req.admin.id, tokenHash]
    );

    // Log activity
    await client.query(
      `INSERT INTO admin_audit_log (
        admin_id, action, resource_type, resource_id, details
      ) VALUES ($1, $2, $3, $4, $5)`,
      [req.admin.id, 'logout', 'system', null, 'Admin logged out']
    );

    client.release();

    res.json({ message: 'Logged out successfully' });

  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get admin profile
app.get('/api/admin/profile', authenticateAdminToken, async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT id, username, email, role, first_name, last_name, phone,
               is_active, last_login, created_at
       FROM admins WHERE id = $1`,
      [req.admin.id]
    );

    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Admin profile not found' });
    }

    // Log activity
    await client.query(
      `INSERT INTO admin_audit_log (
        admin_id, action, resource_type, resource_id
      ) VALUES ($1, $2, $3, $4)`,
      [req.admin.id, 'profile_view', 'own_profile', req.admin.id]
    );

    client.release();
    res.json({ admin: result.rows[0] });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Change admin password
app.put('/api/admin/change-password', authenticateAdminToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long' });
  }

  try {
    const client = await pool.connect();

    // Get current admin password
    const adminResult = await client.query(
      'SELECT password_hash FROM admins WHERE id = $1',
      [req.admin.id]
    );

    if (adminResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Admin account not found' });
    }

    // Verify current password
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, adminResult.rows[0].password_hash);
    if (!isValidCurrentPassword) {
      client.release();
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await client.query(
      `UPDATE admins
       SET password_hash = $1, salt = $2, password_changed_at = NOW()
       WHERE id = $3`,
      [newPasswordHash, salt, req.admin.id]
    );

    // Log activity
    await client.query(
      `INSERT INTO admin_audit_log (
        admin_id, action, resource_type, resource_id
      ) VALUES ($1, $2, $3, $4)`,
      [req.admin.id, 'password_change', 'own_account', req.admin.id]
    );

    client.release();

    res.json({ message: 'Password changed successfully. You will need to login again.' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Create new admin (super admin only)
app.post('/api/admins', authenticateAdminToken, requireRole('super_admin'), async (req, res) => {
  const { username, email, password, role, firstName, lastName, phone } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  try {
    const client = await pool.connect();

    // Check if username or email already exists
    const existingAdmin = await client.query(
      'SELECT id FROM admins WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingAdmin.rows.length > 0) {
      client.release();
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create admin (always active by default)
    const result = await client.query(
      `INSERT INTO admins (
        username, email, password_hash, salt, role, first_name, last_name, phone, is_active, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, username, email, role, first_name, last_name, phone`,
      [username, email, passwordHash, salt, role || 'admin', firstName, lastName, phone, true, req.admin.id]
    );

    const newAdmin = result.rows[0];

    // Add default permissions for the new admin
    const defaultPermissions = [
      { resource: 'members', action: 'manage' },
      { resource: 'applications', action: 'manage' },
      { resource: 'content', action: 'manage' },
      { resource: 'testimonials', action: 'manage' }
    ];

    for (const perm of defaultPermissions) {
      await client.query(
        `INSERT INTO admin_permissions (admin_id, resource, action, allowed)
         VALUES ($1, $2, $3, $4)`,
        [newAdmin.id, perm.resource, perm.action, true]
      );
    }

    // Log activity
    await client.query(
      `INSERT INTO admin_audit_log (
        admin_id, action, resource_type, resource_id, new_values, details
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.admin.id,
        'create_admin',
        'admin_account',
        newAdmin.id,
        JSON.stringify({ username, email, role }),
        `Created admin account: ${username}`
      ]
    );

    client.release();

    console.log(`=== NEW ADMIN CREATED ===`);
    console.log(`Username: ${newAdmin.username}`);
    console.log(`Email: ${newAdmin.email}`);
    console.log(`Role: ${newAdmin.role}`);
    console.log(`Created by: ${req.admin.username}`);
    console.log('========================');

    res.status(201).json({
      message: 'Admin created successfully',
      admin: newAdmin
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

// List all admins
app.get('/api/admins', authenticateAdminToken, requireRole('super_admin'), async (req, res) => {
  try {
    console.log('🔍 Server: Fetching admin users for:', req.admin.username);

    const client = await pool.connect();
    const result = await client.query(
      `SELECT id, username, email, role, first_name, last_name, phone,
               is_active, last_login, created_at
       FROM admins
       WHERE id != $1
       ORDER BY created_at DESC`,
      [req.admin.id]
    );

    // Transform database field names to match frontend expectations
    const admins = result.rows.map(admin => ({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      firstName: admin.first_name,
      lastName: admin.last_name,
      phone: admin.phone,
      isActive: admin.is_active, // Map is_active to isActive
      lastLogin: admin.last_login,
      createdAt: admin.created_at
    }));

    console.log('✅ Server: Retrieved', admins.length, 'admin users');
    console.log('📊 Server: Sample admin data (DB fields):', result.rows.slice(0, 2).map(a => ({
      username: a.username,
      role: a.role,
      is_active: a.is_active
    })));
    console.log('📊 Server: Sample admin data (transformed):', admins.slice(0, 2).map(a => ({
      username: a.username,
      role: a.role,
      isActive: a.isActive
    })));

    client.release();
    res.json({ admins });

  } catch (error) {
    console.error('❌ Server: List admins error:', error);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

// Update admin role
app.put('/api/admins/:id/role', authenticateAdminToken, requireRole('super_admin'), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['admin', 'super_admin'].includes(role)) {
    return res.status(400).json({ error: 'Valid role is required (admin or super_admin)' });
  }

  try {
    const client = await pool.connect();

    // Get current admin info for audit log
    const oldAdminResult = await client.query(
      'SELECT username, role FROM admins WHERE id = $1',
      [id]
    );

    if (oldAdminResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Admin not found' });
    }

    const oldAdmin = oldAdminResult.rows[0];

    // Update role
    await client.query(
      'UPDATE admins SET role = $1 WHERE id = $2',
      [role, id]
    );

    // Log activity
    await client.query(
      `INSERT INTO admin_audit_log (
        admin_id, action, resource_type, resource_id, old_values, new_values, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        req.admin.id,
        'update_admin_role',
        'admin_account',
        id,
        JSON.stringify({ role: oldAdmin.role }),
        JSON.stringify({ role }),
        `Changed role for ${oldAdmin.username} from ${oldAdmin.role} to ${role}`
      ]
    );

    client.release();

    res.json({ message: `Admin role updated to ${role}` });

  } catch (error) {
    console.error('Update admin role error:', error);
    res.status(500).json({ error: 'Failed to update admin role' });
  }
});

// Force password reset for admin
app.post('/api/admins/:id/reset-password', authenticateAdminToken, requireRole('super_admin'), async (req, res) => {
  const { id } = req.params;

  if (id === req.admin.id.toString()) {
    return res.status(403).json({ error: 'You cannot reset your own password' });
  }

  try {
    const client = await pool.connect();

    // Get admin email
    const adminResult = await client.query(
      'SELECT email, username, first_name, last_name FROM admins WHERE id = $1',
      [id]
    );

    if (adminResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Admin not found' });
    }

    const admin = adminResult.rows[0];
    const resetToken = jwt.sign(
      { adminId: id, purpose: 'admin_password_reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Log activity
    await client.query(
      `INSERT INTO admin_audit_log (
        admin_id, action, resource_type, resource_id, details
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        req.admin.id,
        'force_password_reset',
        'admin_account',
        id,
        `Forced password reset for admin ${admin.username}`
      ]
    );

    client.release();

    // Send admin password reset email
    try {
      await sendAdminPasswordResetEmail(admin.email, admin.first_name || admin.username, admin.username, resetToken);
      console.log(`📧 Admin password reset email sent to ${admin.email} for admin ${admin.username}`);
    } catch (emailError) {
      console.error('❌ Failed to send admin password reset email:', emailError.message);
      return res.status(500).json({ error: 'Failed to send password reset email', details: emailError.message });
    }

    res.json({
      message: 'Password reset email has been sent'
    });

  } catch (error) {
    console.error('Force password reset error:', error);
    res.status(500).json({ error: 'Failed to initiate password reset' });
  }
});

// Delete admin account (super admin only)
app.delete('/api/admins/:id', authenticateAdminToken, requireRole('super_admin'), async (req, res) => {
  const { id } = req.params;

  if (id === req.admin.id.toString()) {
    return res.status(403).json({ error: 'You cannot delete your own account' });
  }

  try {
    const client = await pool.connect();

    // Get admin info for logging
    const adminResult = await client.query(
      'SELECT username FROM admins WHERE id = $1',
      [id]
    );

    if (adminResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Admin not found' });
    }

    const admin = adminResult.rows[0];

    // Delete admin sessions first (to avoid foreign key conflicts)
    await client.query('DELETE FROM admin_sessions WHERE admin_id = $1', [id]);

    // Delete admin permissions
    await client.query('DELETE FROM admin_permissions WHERE admin_id = $1', [id]);

    // Delete admin account
    await client.query('DELETE FROM admins WHERE id = $1', [id]);

    // Log activity
    await client.query(
      `INSERT INTO admin_audit_log (
        admin_id, action, resource_type, resource_id, details
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        req.admin.id,
        'delete_admin',
        'admin_account',
        id,
        `Deleted admin account: ${admin.username}`
      ]
    );

    client.release();

    res.json({
      message: 'Admin account deleted successfully',
      deletedAdmin: admin.username
    });

    console.log(`=== ADMIN DELETED ===`);
    console.log(`Username: ${admin.username}`);
    console.log(`Deleted by: ${req.admin.id}`);
    console.log('====================');

  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ error: 'Failed to delete admin account' });
  }
});

// Toggle admin status (activate/deactivate)
app.put('/api/admins/:id/status', authenticateAdminToken, requireRole('super_admin'), async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  console.log('🔄 Server: Admin status toggle request');
  console.log('📊 Server: Admin ID:', id, 'New status:', isActive, 'Requested by:', req.admin.username);

  if (typeof isActive !== 'boolean') {
    console.log('❌ Server: Invalid isActive type:', typeof isActive);
    return res.status(400).json({ error: 'isActive must be a boolean value' });
  }

  // Prevent self-deactivation
  if (id === req.admin.id.toString()) {
    console.log('❌ Server: Cannot modify self');
    return res.status(403).json({ error: 'You cannot deactivate your own account' });
  }

  try {
    const client = await pool.connect();

    // Get current admin info for audit log
    const oldAdminResult = await client.query(
      'SELECT username, is_active FROM admins WHERE id = $1',
      [id]
    );

    if (oldAdminResult.rows.length === 0) {
      console.log('❌ Server: Admin not found:', id);
      client.release();
      return res.status(404).json({ error: 'Admin not found' });
    }

    const oldAdmin = oldAdminResult.rows[0];
    console.log('📊 Server: Current admin status -', oldAdmin.username, 'is_active:', oldAdmin.is_active);

    // Update status
    console.log('🔄 Server: Updating admin status in database...');
    const updateResult = await client.query(
      'UPDATE admins SET is_active = $1 WHERE id = $2',
      [isActive, id]
    );
    console.log('✅ Server: Database update affected', updateResult.rowCount, 'rows');

    // If deactivating admin, also invalidate all their sessions
    if (!isActive) {
      console.log('🔄 Server: Deactivating admin - invalidating sessions...');
      const sessionResult = await client.query(
        'DELETE FROM admin_sessions WHERE admin_id = $1',
        [id]
      );
      console.log('✅ Server: Cleared', sessionResult.rowCount, 'admin sessions');
    }

    // Log activity
    console.log('📝 Server: Logging admin status change in audit log...');
    await client.query(
      `INSERT INTO admin_audit_log (
        admin_id, action, resource_type, resource_id, old_values, new_values, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        req.admin.id,
        isActive ? 'activate_admin' : 'deactivate_admin',
        'admin_account',
        id,
        JSON.stringify({ is_active: oldAdmin.is_active }),
        JSON.stringify({ is_active: isActive }),
        `${isActive ? 'Activated' : 'Deactivated'} admin account: ${oldAdmin.username}`
      ]
    );

    client.release();

    const action = isActive ? 'activated' : 'deactivated';
    console.log('✅ Server: Admin status toggle completed successfully');
    res.json({
      message: `Admin account ${action} successfully`,
      isActive
    });

  } catch (error) {
    console.error('❌ Server: Update admin status error:', error);
    res.status(500).json({ error: 'Failed to update admin status' });
  }
});

// Dashboard statistics endpoint
app.get('/api/admin/dashboard-stats', authenticateAdminToken, async (req, res) => {
  let client;
  try {
    client = await pool.connect();

    // Get member statistics
    const membersResult = await client.query(`
      SELECT COUNT(*) as total_members,
             COUNT(CASE WHEN member_status = 'active' AND application_status = 'approved' THEN 1 END) as active_members
      FROM members
    `);

    // Get pending applications
    const pendingApplicationsResult = await client.query(`
      SELECT COUNT(*) as pending_applications
      FROM members
      WHERE application_status = 'pending'
    `);

    // Get published news/articles
    const activeNewsResult = await client.query(`
      SELECT COUNT(*) as active_news
      FROM content
      WHERE status = 'Published' AND type IN ('Article', 'News')
    `);

    // Get upcoming events (future dates)
    const upcomingEventsResult = await client.query(`
      SELECT COUNT(*) as upcoming_events
      FROM content
      WHERE type = 'Event' AND event_date > CURRENT_DATE
    `);

    const stats = {
      totalMembers: parseInt(membersResult.rows[0].total_members, 10),
      activeMembers: parseInt(membersResult.rows[0].active_members, 10),
      pendingApplications: parseInt(pendingApplicationsResult.rows[0].pending_applications, 10),
      activeNews: parseInt(activeNewsResult.rows[0].active_news, 10),
      upcomingEvents: parseInt(upcomingEventsResult.rows[0].upcoming_events, 10)
    };

    // Log dashboard access
    await client.query(
      `INSERT INTO admin_audit_log (
        admin_id, action, resource_type, resource_id, details
      ) VALUES ($1, $2, $3, $4, $5)`,
      [req.admin.id, 'dashboard_access', 'system', null, 'Accessed admin dashboard statistics']
    );

    client.release();
    client = null;

    res.json(stats);

  } catch (error) {
    if (client) {
      client.release();
    }
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({ error: 'Failed to load dashboard statistics' });
  }
});

// =========================================
// NOTIFICATION MANAGEMENT ENDPOINTS
// =========================================

// Get all notification recipients
app.get('/api/admin/notification-recipients', authenticateAdminToken, async (req, res) => {
  try {
    const client = await pool.connect();
    const recipientsResult = await client.query(
      `SELECT id, email, is_active, created_at, updated_at
       FROM notification_recipients
       ORDER BY created_at DESC`
    );

    const settingsResult = await client.query(
      `SELECT setting_value, setting_name
       FROM notification_settings
       WHERE setting_name = 'notifications_enabled'`
    );

    client.release();

    const recipients = recipientsResult.rows.map(recipient => ({
      id: recipient.id,
      email: recipient.email,
      isActive: recipient.is_active,
      createdAt: recipient.created_at,
      updatedAt: recipient.updated_at
    }));

    const settings = {
      notificationsEnabled: settingsResult.rows.length > 0 ? settingsResult.rows[0].setting_value : true
    };

    res.json({ recipients, settings });
  } catch (error) {
    console.error('Error fetching notification recipients:', error);
    res.status(500).json({ error: 'Failed to fetch notification recipients' });
  }
});

// Add new notification recipient
app.post('/api/admin/notification-recipients', authenticateAdminToken, async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  try {
    const client = await pool.connect();

    // Check if email already exists
    const existingResult = await client.query(
      'SELECT id FROM notification_recipients WHERE email = $1',
      [email]
    );

    if (existingResult.rows.length > 0) {
      client.release();
      return res.status(409).json({ error: 'Email address already exists' });
    }

    // Add new recipient
    const result = await client.query(
      `INSERT INTO notification_recipients (email, is_active)
       VALUES ($1, true)
       RETURNING id, email, is_active, created_at, updated_at`,
      [email]
    );

    client.release();

    const recipient = result.rows[0];
    res.status(201).json({
      message: 'Notification recipient added successfully',
      recipient: {
        id: recipient.id,
        email: recipient.email,
        isActive: recipient.is_active,
        createdAt: recipient.created_at,
        updatedAt: recipient.updated_at
      }
    });
  } catch (error) {
    console.error('Error adding notification recipient:', error);
    res.status(500).json({ error: 'Failed to add notification recipient' });
  }
});

// Delete notification recipient
app.delete('/api/admin/notification-recipients/:id', authenticateAdminToken, async (req, res) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();

    // Get recipient info before deletion
    const recipientResult = await client.query(
      'SELECT email FROM notification_recipients WHERE id = $1',
      [id]
    );

    if (recipientResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Notification recipient not found' });
    }

    const email = recipientResult.rows[0].email;

    // Delete the recipient
    await client.query('DELETE FROM notification_recipients WHERE id = $1', [id]);

    client.release();

    res.json({
      message: 'Notification recipient removed successfully',
      deletedRecipient: email
    });
  } catch (error) {
    console.error('Error deleting notification recipient:', error);
    res.status(500).json({ error: 'Failed to delete notification recipient' });
  }
});

// Toggle notification recipient status
app.put('/api/admin/notification-recipients/:id/status', authenticateAdminToken, async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ error: 'isActive must be a boolean value' });
  }

  try {
    const client = await pool.connect();

    const result = await client.query(
      `UPDATE notification_recipients
       SET is_active = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, is_active, created_at, updated_at`,
      [isActive, id]
    );

    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Notification recipient not found' });
    }

    client.release();

    const recipient = result.rows[0];
    res.json({
      message: `Notification recipient ${isActive ? 'activated' : 'deactivated'} successfully`,
      recipient: {
        id: recipient.id,
        email: recipient.email,
        isActive: recipient.is_active,
        createdAt: recipient.created_at,
        updatedAt: recipient.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating notification recipient status:', error);
    res.status(500).json({ error: 'Failed to update notification recipient status' });
  }
});

// Update notification settings (enable/disable notifications)
app.put('/api/admin/notification-settings', authenticateAdminToken, async (req, res) => {
  const { enabled } = req.body;

  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'enabled must be a boolean value' });
  }

  try {
    const client = await pool.connect();

    const result = await client.query(
      `UPDATE notification_settings
       SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
       WHERE setting_name = 'notifications_enabled'
       RETURNING setting_name, setting_value, updated_at`,
      [enabled]
    );

    client.release();

    const setting = result.rows[0];
    res.json({
      message: `Notifications ${enabled ? 'enabled' : 'disabled'} successfully`,
      settings: {
        notificationsEnabled: setting.setting_value
      }
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// All other GET requests not handled by API routes should return the React app
// All other GET requests not handled by API routes should return the React app
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Admin Authentication API endpoints available at:');
  console.log('POST /api/admin/login - Admin login');
  console.log('POST /api/admin/logout - Admin logout');
  console.log('GET /api/admin/profile - Get admin profile');
  console.log('POST /api/admins - Create new admin (super admin only)');
  console.log('GET /api/admins - List admins (super admin only)');
  console.log('PUT /api/admin/change-password - Change admin password');
  console.log('PUT /api/admins/:id/role - Update admin role (super admin only)');
});
