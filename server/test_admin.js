import pool from './lib/db.js';

async function testAdminSetup() {
  console.log('🧪 Testing Admin Authentication Setup...\n');

  try {
    const client = await pool.connect();

    // Test 1: Check admin tables exist
    console.log('1️⃣ Checking if admin tables exist...');
    const tables = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE tablename LIKE 'admin%'
      AND schemaname = 'public'
    `);

    console.log('✅ Admin tables found:', tables.rows.map(r => r.tablename));

    if (tables.rows.length === 0) {
      console.log('❌ No admin tables found! Creating admin tables...');

      // Create admin tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS admins (
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

        CREATE TABLE IF NOT EXISTS admin_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
          token_hash VARCHAR(255) NOT NULL UNIQUE,
          ip_address VARCHAR(45),
          user_agent TEXT,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS admin_permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
          resource VARCHAR(100) NOT NULL,
          action VARCHAR(100) NOT NULL,
          allowed BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS admin_audit_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
          action VARCHAR(100) NOT NULL,
          resource_type VARCHAR(50) NOT NULL,
          resource_id VARCHAR(255),
          old_values JSONB,
          new_values JSONB,
          ip_address VARCHAR(45),
          user_agent TEXT,
          status VARCHAR(20) DEFAULT 'success',
          details TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('✅ Admin tables created!');
    }

    // Test 2: Check if admin user exists
    console.log('\n2️⃣ Checking if admin user exists...');
    const adminUser = await client.query('SELECT * FROM admins LIMIT 1');
    console.log('Admin users found:', adminUser.rows.length);

    if (adminUser.rows.length === 0) {
      console.log('❌ No admin user found! Creating default admin...');

      // Create default admin (password: TempAdmin123!)
      const bcrypt = await import('bcrypt');
      const saltRounds = 12;
      const password = 'TempAdmin123!';
      const salt = await bcrypt.default.genSalt(saltRounds);
      const passwordHash = await bcrypt.default.hash(password, salt);

      const result = await client.query(
        `INSERT INTO admins (username, email, password_hash, salt, role, first_name, last_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, username, email, role`,
        ['bsncp_admin', 'admin@bspcp.org.uk', passwordHash, salt, 'super_admin', 'System', 'Administrator']
      );

      console.log('✅ Default admin created:', result.rows[0]);
    }

    // Test 3: Show admin user details
    console.log('\n3️⃣ Admin user details:');
    const adminDetails = await client.query('SELECT id, username, email, role FROM admins');
    console.log('Admin users:', adminDetails.rows);

    client.release();

    console.log('\n🎉 Admin authentication setup looks good!');
    console.log('\nDefault credentials:');
    console.log('Email: admin@bspcp.org.uk');
    console.log('Password: TempAdmin123!');

  } catch (error) {
    console.error('❌ Admin setup test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testAdminSetup();
