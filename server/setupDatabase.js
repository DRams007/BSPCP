import pool from './lib/db.js';

async function setupDatabase() {
  try {
    // Drop existing tables if they exist to apply new schema cleanly
    // Drop in reverse dependency order to avoid foreign key constraint issues

    await pool.query(`DROP TABLE IF EXISTS backup_records CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS member_authentication CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS member_payments CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS member_certificates CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS member_personal_documents CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS member_contact_details CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS member_professional_details CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS members CASCADE;`);

    // Add back the dropped tables that are missing
    await pool.query(`DROP TABLE IF EXISTS content CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS bookings CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS testimonials CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS member_cpd CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS payment_upload_logs CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS payment_audit_log CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS contact_messages CASCADE;`);

    // Drop admin tables (in reverse dependency order)
    await pool.query(`DROP TABLE IF EXISTS admin_audit_log CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS admin_sessions CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS admin_permissions CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS admins CASCADE;`);

    await pool.query(`DROP TABLE IF EXISTS notification_recipients CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS notification_settings CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS counsellor_notification_preferences CASCADE;`);

    // Admin authentication tables (create BEFORE members table to satisfy foreign key constraint)
    await pool.query(`
      CREATE TABLE admins (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          salt VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'admin',
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          phone VARCHAR(30),
          is_active BOOLEAN DEFAULT true,
          last_login TIMESTAMP WITH TIME ZONE,
          password_changed_at TIMESTAMP WITH TIME ZONE,
          login_attempts INTEGER DEFAULT 0,
          locked_until TIMESTAMP WITH TIME ZONE,
          created_by UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE admin_permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
          resource VARCHAR(100) NOT NULL, -- e.g., 'members', 'applications', 'content'
          action VARCHAR(100) NOT NULL, -- e.g., 'read', 'write', 'delete', 'manage'
          allowed BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE admin_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
          token_hash VARCHAR(255) NOT NULL UNIQUE,
          ip_address VARCHAR(45),
          user_agent TEXT,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE admin_audit_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
          action VARCHAR(100) NOT NULL, -- e.g., 'login', 'update_member', 'delete_application'
          resource_type VARCHAR(50) NOT NULL, -- e.g., 'member', 'application', 'content'
          resource_id VARCHAR(255), -- ID or identifier of the affected resource
          old_values JSONB, -- Previous state for change tracking
          new_values JSONB, -- New state for change tracking
          ip_address VARCHAR(45),
          user_agent TEXT,
          status VARCHAR(20) DEFAULT 'success', -- success, failed, warning
          details TEXT, -- Additional context/details
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          full_name VARCHAR(255),
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          bspcp_membership_number VARCHAR(50),
          id_number VARCHAR(50) NOT NULL,
          date_of_birth DATE NOT NULL,
          gender VARCHAR(10) NOT NULL,
          nationality VARCHAR(100) NOT NULL,
          membership_type VARCHAR(50) DEFAULT 'professional' CHECK (membership_type IN ('professional', 'student')),
          -- Student-specific fields
          institution_name VARCHAR(255),
          study_year VARCHAR(50),
          counselling_coursework TEXT,
          internship_supervisor_name VARCHAR(255),
          internship_supervisor_license VARCHAR(100),
          internship_supervisor_contact VARCHAR(255),
          supervised_practice_hours VARCHAR(50),
          application_status VARCHAR(50) DEFAULT 'pending',
          member_status VARCHAR(50) DEFAULT 'pending',
          review_comment TEXT,
          cpd_document TEXT,
          cpd_points INTEGER DEFAULT 0,
          -- Payment tracking fields (advanced system)
          payment_proof_url VARCHAR(500),
          payment_upload_token VARCHAR(255) UNIQUE,
          payment_status VARCHAR(50) DEFAULT 'not_requested' CHECK (payment_status IN ('not_requested', 'requested', 'uploaded', 'verified', 'rejected')),
          payment_requested_at TIMESTAMP WITH TIME ZONE,
          payment_uploaded_at TIMESTAMP WITH TIME ZONE,
          payment_verified_at TIMESTAMP WITH TIME ZONE,
          payment_rejected_at TIMESTAMP WITH TIME ZONE,
          payment_verified_by UUID REFERENCES admins(id),
          payment_request_count INTEGER DEFAULT 0,
          counsellor_visible BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE content (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'Draft',
          content TEXT,
          author VARCHAR(255),
          location VARCHAR(255),
          event_date DATE,
          event_time TIME,
          meta_description VARCHAR(160),
          tags TEXT,
          featured_image_path VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE testimonials (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          role VARCHAR(100),
          content TEXT NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          anonymous BOOLEAN DEFAULT FALSE,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE member_professional_details (
          id SERIAL PRIMARY KEY,
          member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
          occupation VARCHAR(255),
          organization_name VARCHAR(255),
          highest_qualification TEXT,
          other_qualifications TEXT,
          scholarly_publications TEXT,
          specializations TEXT[],
          employment_status VARCHAR(50),
          years_experience VARCHAR(50),
          bio TEXT,
          title VARCHAR(255),
          languages TEXT[],
          session_types TEXT[],
          availability VARCHAR(100)
      );
    `);

    await pool.query(`
      CREATE TABLE member_contact_details (
          id SERIAL PRIMARY KEY,
          member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
          phone VARCHAR(30),
          email VARCHAR(255) UNIQUE,
          website VARCHAR(255),
          physical_address TEXT,
          city VARCHAR(100),
          postal_address TEXT,
          emergency_contact VARCHAR(255),
          emergency_phone VARCHAR(30),
          show_email BOOLEAN DEFAULT true,
          show_phone BOOLEAN DEFAULT true,
          show_address BOOLEAN DEFAULT false
      );
    `);

    await pool.query(`
      CREATE TABLE member_payments (
          id SERIAL PRIMARY KEY,
          member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
          proof_of_payment_path VARCHAR(255) NOT NULL,
          payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE member_authentication (
          id SERIAL PRIMARY KEY,
          member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
          username VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255),  -- Allow NULL initially (will be set when user creates password)
          salt VARCHAR(255),           -- Allow NULL initially (will be set when user creates password)
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE member_personal_documents (
          id SERIAL PRIMARY KEY,
          member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
          id_document_path VARCHAR(500),
          profile_image_path VARCHAR(500),
          uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE member_certificates (
          id SERIAL PRIMARY KEY,
          member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
          file_path VARCHAR(500) NOT NULL,
          original_filename VARCHAR(255),
          uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE bookings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          counsellor_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
          client_name VARCHAR(255) NOT NULL,
          phone_number VARCHAR(30) NOT NULL,
          email VARCHAR(255) NOT NULL,
          category VARCHAR(255),
          needs TEXT,
          session_type VARCHAR(50),
          support_urgency VARCHAR(50),
          booking_date DATE NOT NULL,
          booking_time TIME NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE backup_records (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          filename VARCHAR(255) NOT NULL,
          filepath VARCHAR(500) NOT NULL,
          filesize BIGINT NOT NULL,
          file_count INTEGER DEFAULT 0,
          backup_type VARCHAR(100) DEFAULT 'database',
          formats TEXT[] DEFAULT ARRAY['dump', 'bak', 'sql'],
          includes JSONB DEFAULT '[]'::jsonb,
          status VARCHAR(50) DEFAULT 'active',
          created_by VARCHAR(255) DEFAULT 'BSPCP_admin',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP WITH TIME ZONE NULL
      );
    `);

    await pool.query(`
      CREATE TABLE member_cpd (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          points INTEGER NOT NULL,
          document_path VARCHAR(255),
          status VARCHAR(50) DEFAULT 'approved',
          completion_date DATE,
          uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Payment tracking system tables (audit and logging)
    await pool.query(`
      CREATE TABLE payment_upload_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        upload_token VARCHAR(255),
        original_filename VARCHAR(255),
        stored_filename VARCHAR(255),
        file_size INTEGER,
        file_type VARCHAR(100),
        ip_address INET,
        user_agent TEXT,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

        -- Add validation constraints
        CONSTRAINT valid_filename CHECK (length(coalesce(original_filename, '')) > 0),
        CONSTRAINT valid_file_size CHECK (file_size IS NULL OR file_size > 0),
        CONSTRAINT valid_file_type CHECK (file_type IN ('pdf', 'jpg', 'jpeg', 'png'))
      );
    `);

    await pool.query(`
      CREATE TABLE payment_audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        member_id UUID NOT NULL REFERENCES members(id),
        admin_id UUID REFERENCES admins(id),
        action VARCHAR(100) NOT NULL,
        details TEXT,
        ip_address INET,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for performance optimization on payment tracking system
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_members_payment_status ON members(payment_status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_members_payment_token ON members(payment_upload_token);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_members_payment_verified_by ON members(payment_verified_by);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_payment_upload_logs_member_id ON payment_upload_logs(member_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_payment_upload_logs_upload_token ON payment_upload_logs(upload_token);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_payment_audit_log_member_id ON payment_audit_log(member_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_payment_audit_log_admin_id ON payment_audit_log(admin_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_payment_audit_log_action ON payment_audit_log(action);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_members_payment_status_requested ON members(payment_status) WHERE payment_status = 'uploaded';`);

    // Counselling notification preferences table (for counsellors to manage booking notifications)
    await pool.query(`
      CREATE TABLE counsellor_notification_preferences (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
          booking_notifications BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(member_id)
      );
    `);

    // Notification management tables
    await pool.query(`
      CREATE TABLE notification_recipients (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL UNIQUE,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE notification_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          setting_name VARCHAR(100) NOT NULL UNIQUE,
          setting_value BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default notification settings
    await pool.query(`
      INSERT INTO notification_recipients (email) VALUES ('bspcpemail@gmail.com');
    `);

    await pool.query(`
      INSERT INTO notification_settings (setting_name, setting_value) VALUES ('notifications_enabled', true);
    `);

    await pool.query(`
      CREATE TABLE contact_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(30),
        inquiry_type VARCHAR(50) NOT NULL CHECK (inquiry_type IN ('general', 'membership', 'professional', 'complaint', 'media', 'partnership')),
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Membership categories for different fee structures
    await pool.query(`DROP TABLE IF EXISTS membership_categories;`);
    await pool.query(`
      CREATE TABLE membership_categories (
        id SERIAL PRIMARY KEY,
        category_type VARCHAR(50) UNIQUE NOT NULL,
        joining_fee DECIMAL(10,2) NOT NULL,
        annual_fee DECIMAL(10,2) NOT NULL,
        description TEXT,
        requires_supervisor_info BOOLEAN DEFAULT FALSE,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default membership categories
    await pool.query(`
      INSERT INTO membership_categories (category_type, joining_fee, annual_fee, description, requires_supervisor_info) VALUES
      ('professional', 50.00, 150.00, 'Full professional membership for qualified counsellors with Bachelor''s degree minimum', FALSE),
      ('student', 25.00, 75.00, 'Student membership for counselling trainees still in training programs', TRUE);
    `);

    // Create sequence for BSPCP membership numbering starting at 175
    await pool.query(`DROP SEQUENCE IF EXISTS bspcp_membership_number_seq;`);
    await pool.query(`CREATE SEQUENCE bspcp_membership_number_seq START WITH 175 INCREMENT BY 1;`);

    console.log('Database tables created or updated successfully.');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
