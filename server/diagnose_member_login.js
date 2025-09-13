import pool from './lib/db.js';
import bcrypt from 'bcrypt';

async function diagnoseMemberLogin() {
  console.log('🔍 BSPCP Member Login Diagnostic Tool\n');
  console.log('==========================================\n');

  try {
    const client = await pool.connect();

    // 1. Check member tables exist
    console.log('1️⃣  CHECKING DATABASE TABLES...');
    const tables = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE tablename LIKE 'member%'
      AND schemaname = 'public'
      ORDER BY tablename
    `);

    console.log('Member-related tables found:', tables.rows.length);
    tables.rows.forEach(table => {
      console.log(`  ✓ ${table.tablename}`);
    });

    if (tables.rows.length === 0) {
      console.log('❌ No member tables found! Run setupDatabase.js first.');
      return;
    }

    // 2. Check total members
    console.log('\n2️⃣  MEMBER STATISTICS...');
    const memberStats = await client.query(`
      SELECT
        COUNT(*) as total_members,
        COUNT(CASE WHEN application_status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN application_status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN application_status = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN member_status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN member_status = 'inactive' THEN 1 END) as inactive
      FROM members
    `);

    const stats = memberStats.rows[0];
    console.log(`Total members: ${stats.total_members}`);
    console.log(`- Pending applications: ${stats.pending}`);
    console.log(`- Approved applications: ${stats.approved}`);
    console.log(`- Rejected applications: ${stats.rejected}`);
    console.log(`- Active members: ${stats.active}`);
    console.log(`- Inactive members: ${stats.inactive}`);

    // 3. Check approved members lacking authentication
    console.log('\n3️⃣  AUTHENTICATION CHECK...');
    const missingAuth = await client.query(`
      SELECT m.id, m.first_name, m.last_name, mcd.email
      FROM members m
      LEFT JOIN member_authentication ma ON m.id = ma.member_id
      LEFT JOIN member_contact_details mcd ON m.id = mcd.member_id
      WHERE m.application_status = 'approved'
      AND (ma.member_id IS NULL OR mcd.member_id IS NULL OR ma.password_hash IS NULL)
    `);

    console.log('Approved members with incomplete profiles:', missingAuth.rows.length);
    if (missingAuth.rows.length > 0) {
      missingAuth.rows.forEach(member => {
        console.log(`  ❌ ID: ${member.id}, Name: ${member.first_name} ${member.last_name}, Email: ${member.email || 'NO EMAIL'}`);
      });
    }

    // 4. Check complete profiles ready for login
    console.log('\n4️⃣  LOGIN-READY MEMBERS...');
    const readyMembers = await client.query(`
      SELECT m.id, m.first_name, m.last_name, mcd.email, ma.username,
             ma.password_hash IS NOT NULL as has_password
      FROM members m
      JOIN member_contact_details mcd ON m.id = mcd.member_id
      JOIN member_authentication ma ON m.id = ma.member_id
      WHERE m.application_status = 'approved'
      AND m.member_status = 'active'
    `);

    console.log('Members ready to login:', readyMembers.rows.length);
    readyMembers.rows.forEach(member => {
      console.log(`  ✅ ${member.first_name} ${member.last_name}`);
      console.log(`     ID: ${member.id}, Email: ${member.email}, Username: ${member.username}, Password Set: ${member.has_password ? 'YES' : 'NO'}`);
    });

    // 5. List specific members if any exist
    if (readyMembers.rows.length > 0) {
      console.log('\n5️⃣  LOGIN CREDENTIALS (For Testing)...');

      for (const member of readyMembers.rows) {
        console.log(`\n🎯 ${member.first_name} ${member.last_name}:`);
        console.log(`   Email: ${member.email}`);
        console.log(`   Username: ${member.username}`);

        // Generate default password if needed
        if (!member.has_password) {
          const defaultPassword = 'TempPass123!';
          console.log(`   ⚠️  No password set - use: ${defaultPassword}`);
          console.log(`      Login link: http://localhost:8080/set-password?token=<setup-token>`);
        } else {
          console.log(`   ✅ Password is already set`);
        }
      }
    }

    // 6. Create missing authentication records if needed
    console.log('\n6️⃣  AUTO-FIXING MISSING RECORDS...');

    const approvedWithoutAuth = await client.query(`
      SELECT m.id, m.first_name, m.last_name
      FROM members m
      WHERE m.application_status = 'approved'
      AND m.id NOT IN (SELECT member_id FROM member_authentication)
    `);

    console.log(`Members missing authentication records: ${approvedWithoutAuth.rows.length}`);

    if (approvedWithoutAuth.rows.length > 0) {
      console.log('\n🔧 Creating missing authentication records...');

      for (const member of approvedWithoutAuth.rows) {
        const firstName = member.first_name || '';
        const lastName = member.last_name || '';
        const username = `${firstName[0].toLowerCase() || ''}${lastName.toLowerCase()}`;

        const defaultPassword = 'TempPass123!';
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(defaultPassword, salt);

        try {
          await client.query(
            `INSERT INTO member_authentication (member_id, username, password_hash, salt)
             VALUES ($1, $2, $3, $4)`,
            [member.id, username, passwordHash, salt]
          );

          console.log(`  ✅ Created auth record for: ${member.first_name} ${member.last_name}`);
          console.log(`     Username: ${username}, Temp Password: ${defaultPassword}`);

        } catch (authError) {
          console.log(`  ❌ Failed to create auth record for ${member.first_name} ${member.last_name}:`, authError.message);
        }
      }
    }

    // 7. Check contact details completeness
    console.log('\n7️⃣  CONTACT DETAILS CHECK...');
    const contactsWithoutEmail = await client.query(`
      SELECT m.id, m.first_name, m.last_name
      FROM members m
      LEFT JOIN member_contact_details mcd ON m.id = mcd.member_id
      WHERE m.application_status = 'approved'
      AND (mcd.email IS NULL OR mcd.email = '')
    `);

    console.log(`Approved members missing email addresses: ${contactsWithoutEmail.rows.length}`);
    contactsWithoutEmail.rows.forEach(member => {
      console.log(`  ⚠️  ID: ${member.id}, Name: ${member.first_name} ${member.last_name}`);
    });

    client.release();

    // 8. Summary and Recommendations
    console.log('\n🎯 SUMMARY & RECOMMENDATIONS');
    console.log('==============================');

    if (readyMembers.rows.length > 0) {
      console.log('✅ Members are ready to login!');
      console.log('✓ Use the login form at: http://localhost:8080/login');
      console.log('✓ Or use the credentials listed above');
    }

    if (missingAuth.rows.length > 0 || approvedWithoutAuth.rows.length > 0) {
      console.log('⚠️  Some members need authentication records created');
      console.log('✓ Missing authentication records have been auto-created');
      console.log('✓ Use default password: TempPass123!');
    }

    if (contactsWithoutEmail.rows.length > 0) {
      console.log('⚠️  Some members missing email addresses');
      console.log('✓ Email addresses are required for login');
    }

    console.log('\n🔗 Next Steps:');
    console.log('1. Start the server: cd server && node index.js');
    console.log('2. Visit: http://localhost:8080/login');
    console.log('3. Use the credentials listed above');

  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  } finally {
    await pool.end();
  }
}

diagnoseMemberLogin();
