import pg from 'pg';

const client = new pg.Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'botshub',
  database: 'BSPCP'
});

async function checkMemberStatus() {
  console.log('🔍 CHECKING MEMBER AUTHENTICATION STATE\n');

  try {
    await client.connect();

    // Check member 'dramaduba'
    const result = await client.query(`
      SELECT
        m.id, m.first_name, m.last_name, m.application_status, m.member_status,
        ma.username, ma.password_hash IS NOT NULL as has_password,
        ma.password_hash IS NULL as is_null_password,
        LENGTH(ma.password_hash) as hash_length,
        LENGTH(ma.salt) as salt_length
      FROM members m
      LEFT JOIN member_authentication ma ON m.id = ma.member_id
      WHERE ma.username = 'dramaduba'
      OR LOWER(m.first_name) LIKE 'ditiro'
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      console.log('❌ Member "dramaduba" not found');
      return;
    }

    const member = result.rows[0];
    console.log('📊 MEMBER DETAILS:');
    console.log(`   Name: ${member.first_name} ${member.last_name}`);
    console.log(`   Username: ${member.username}`);
    console.log(`   Application Status: ${member.application_status}`);
    console.log(`   Member Status: ${member.member_status}`);
    console.log(`   Has Password: ${member.has_password}`);
    console.log(`   Password is NULL: ${member.is_null_password}`);
    console.log(`   Hash Length: ${member.hash_length || 'N/A'}`);
    console.log(`   Salt Length: ${member.salt_length || 'N/A'}`);

    console.log('\n📝 ISSUE DIAGNOSIS:');
    if (member.is_null_password) {
      console.log('❌ PROBLEM FOUND: Password hash is NULL');
      console.log('💡 This is why login fails - stored password is null');
      console.log('🔧 SOLUTION: Password reset should fix this');
    } else {
      console.log('✅ Password hash is present');
    }

    // Also check the actual values for debugging
    const authCheck = await client.query(
      'SELECT password_hash FROM member_authentication WHERE member_id = $1',
      [member.id]
    );

    if (authCheck.rows.length > 0) {
      const hash = authCheck.rows[0].password_hash;
      console.log(`\n🔐 RAW PASSWORD HASH: ${hash ? 'PRESENT' : 'NULL'}`);
    }

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  } finally {
    await client.end();
  }
}

checkMemberStatus();
