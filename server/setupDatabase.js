import pool from './lib/db.js';

async function setupDatabase() {
  try {
    // Drop existing tables if they exist to apply new schema cleanly
    // Drop admin tables first (to avoid dependency issues)
    await pool.query(`DROP TABLE IF EXISTS admin_audit_log CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS admin_sessions CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS admin_permissions CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS admins CASCADE;`);

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
    await pool.query(`DROP TABLE IF EXISTS notification_recipients CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS notification_settings CASCADE;`);

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
          application_status VARCHAR(50) DEFAULT 'pending',
          member_status VARCHAR(50) DEFAULT 'pending',
          review_comment TEXT,
          cpd_document TEXT,
          cpd_points INTEGER DEFAULT 0,
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
          fee_range VARCHAR(100),
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

    // Admin authentication tables
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
      INSERT INTO notification_recipients (email) VALUES ('bspcpemailservice@gmail.com');
    `);

    await pool.query(`
      INSERT INTO notification_settings (setting_name, setting_value) VALUES ('notifications_enabled', true);
    `);

    console.log('Database tables created or updated successfully.');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
