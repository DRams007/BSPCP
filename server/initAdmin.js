import pool from './lib/db.js';
import bcrypt from 'bcrypt';

async function initAdminUser() {
  try {
    console.log('Initializing default admin user...');

    // Check if admin user already exists
    const existingAdmin = await pool.query(
      'SELECT id FROM admins WHERE email = $1',
      ['admin@bspcp.org.uk']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('Default admin user already exists. Deleting existing admin and recreating...');
      const adminId = existingAdmin.rows[0].id;

      // Delete related records first (due to foreign key constraints)
      await pool.query('DELETE FROM admin_permissions WHERE admin_id = $1', [adminId]);
      await pool.query('DELETE FROM admin_sessions WHERE admin_id = $1', [adminId]);
      await pool.query('DELETE FROM admins WHERE id = $1', [adminId]);

      console.log('Existing admin user and related data deleted.');
    }

    // Create admin user
    const username = 'bsncp_admin';
    const password = 'Password123$'; // Temporary password - should be changed immediately
    const email = 'bspcpemail@gmail.com';

    // Hash the password
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert admin user
    const result = await pool.query(
      `INSERT INTO admins (
        username, email, password_hash, salt, role, first_name, last_name, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, username, email`,
      [
        username,
        email,
        passwordHash,
        salt,
        'super_admin',
        'System',
        'Administrator',
        true
      ]
    );

    console.log('✅ Default admin user created successfully!');
    console.log('Username:', result.rows[0].username);
    console.log('Email:', result.rows[0].email);
    console.log('⚠️  IMPORTANT: Please change the temporary password immediately after login!');
    console.log('Temporary Password:', password);

    // Add default permissions for the admin
    const adminId = result.rows[0].id;
    const defaultPermissions = [
      { resource: 'members', action: 'manage' },
      { resource: 'applications', action: 'manage' },
      { resource: 'content', action: 'manage' },
      { resource: 'testimonials', action: 'manage' },
      { resource: 'bookings', action: 'manage' },
      { resource: 'backups', action: 'manage' },
      { resource: 'admin_users', action: 'manage' },
      { resource: 'reports', action: 'manage' },
      { resource: 'settings', action: 'manage' },
      { resource: 'notifications', action: 'manage' }
    ];

    for (const perm of defaultPermissions) {
      await pool.query(
        `INSERT INTO admin_permissions (admin_id, resource, action, allowed)
         VALUES ($1, $2, $3, $4)`,
        [adminId, perm.resource, perm.action, true]
      );
    }

    console.log('✅ Default permissions assigned to admin user.');

  } catch (error) {
    console.error('Error initializing admin user:', error);
  } finally {
    await pool.end();
  }
}

initAdminUser();
