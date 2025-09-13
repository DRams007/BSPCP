const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

async function testPasswordReset() {
  console.log('🧪 TESTING ACTUAL PASSWORD RESET ENDPOINT\n');

  try {
    // 1. Get member details from database
    const mysql = require('mysql2/promise');
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'postgres',
      password: 'botshub',
      database: 'BSPCP',
      connectionLimit: 5,
    });

    const [rows] = await pool.execute(
      `SELECT m.id, m.first_name, m.last_name, mcd.email, ma.username
       FROM members m
       JOIN member_contact_details mcd ON m.id = mcd.member_id
       JOIN member_authentication ma ON m.id = ma.member_id
       WHERE m.application_status = 'approved'
       LIMIT 1`
    );

    if (rows.length === 0) {
      console.log('❌ No approved members found');
      return;
    }

    const member = rows[0];
    console.log(`✅ Testing with member: ${member.first_name} ${member.last_name} (${member.username})`);

    // 2. Generate a valid JWT token for password reset
    const resetToken = jwt.sign({ memberId: member.id }, JWT_SECRET, { expiresIn: '1h' });
    console.log(`🔑 Generated valid reset token for member ID: ${member.id}`);

    // 3. Test the actual password reset endpoint
    const response = await fetch('http://localhost:3001/api/member/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: resetToken,
        newPassword: 'NewTestPassword123!'
      })
    });

    const result = await response.json();
    console.log(`📡 HTTP Response status: ${response.status}`);

    if (response.ok) {
      console.log('✅ Password reset successful:', result.message);

      // 4. Verify the database was actually updated
      const [verifyRows] = await pool.execute(
        'SELECT password_hash IS NOT NULL as has_password FROM member_authentication WHERE member_id = ?',
        [member.id]
      );

      if (verifyRows.length > 0) {
        console.log(`🔐 Database verification - Password hash updated: ${verifyRows[0].has_password ? 'SUCCESS' : 'FAILED'}`);
      } else {
        console.log('❌ Could not verify database update');
      }

    } else {
      console.log('❌ Password reset failed:', result.error);
      if (result.details) {
        console.log('Details:', result.details);
      }
      if (result.code) {
        console.log('Error code:', result.code);
      }
    }

    await pool.end();

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Only run if this file is called directly
if (require.main === module) {
  testPasswordReset();
}

module.exports = { testPasswordReset };
