import jwt from 'jsonwebtoken';
import http from 'http';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

async function testPasswordResetDirectly() {
  console.log('🧪 TESTING PASSWORD RESET DIRECTLY\n');

  try {
    // 1. Import the pool from our existing lib
    const { pool } = await import('./server/lib/db.js');

    // 2. Get the test member
    const client = await pool.connect();
    const memberResult = await client.query(`
      SELECT m.id, ma.username, m.first_name, m.last_name
      FROM members m
      JOIN member_authentication ma ON m.id = ma.member_id
      WHERE ma.username = 'dramaduba'
    `);

    if (memberResult.rows.length === 0) {
      console.log('❌ Test member not found');
      client.release();
      return;
    }

    const member = memberResult.rows[0];
    client.release();

    console.log(`✅ Testing with member: ${member.first_name} ${member.last_name} (${member.username})`);
    console.log(`   Member ID: ${member.id}`);

    // 3. Generate a valid JWT token
    const resetToken = jwt.sign({ memberId: member.id }, JWT_SECRET, { expiresIn: '1h' });
    console.log(`🔑 Generated reset token for member ID: ${member.id}`);

    // 4. Make HTTP request to our server
    // First, let me check if server is running by making a simple request
    console.log('🔗 Testing connection to server...');

    const testRequest = () => {
      return new Promise((resolve, reject) => {
        const req = http.request({
          hostname: 'localhost',
          port: 3001,
          path: '/api/db-test',
          method: 'GET'
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            console.log('✅ Server connection test:', data.substring(0, 100));
            resolve(true);
          });
        });

        req.on('error', (err) => {
          console.log('❌ Server connection failed:', err.message);
          reject(err);
        });

        req.end();
      });
    };

    try {
      await testRequest();
      console.log('✅ Server is running, proceeding with password reset test...');

      // Now test actual password reset
      const resetData = JSON.stringify({
        token: resetToken,
        newPassword: 'DirectTestPassword123!'
      });

      const passwordResetRequest = () => {
        return new Promise((resolve, reject) => {
          const req = http.request({
            hostname: 'localhost',
            port: 3001,
            path: '/api/member/reset-password',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(resetData)
            }
          }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
              data += chunk;
            });
            res.on('end', () => {
              try {
                const result = JSON.parse(data);
                console.log(`📡 Password reset response (${res.statusCode}):`, result);
                resolve({ statusCode: res.statusCode, result });
              } catch (parseError) {
                console.log('📡 Raw response:', data);
                resolve({ statusCode: res.statusCode, data });
              }
            });
          });

          req.on('error', (err) => {
            console.log('❌ Password reset request failed:', err.message);
            reject(err);
          });

          req.write(resetData);
          req.end();
        });
      };

      const resetResult = await passwordResetRequest();

      if (resetResult.statusCode === 200) {
        console.log('✅ Password reset succeeded!');

        // Verify the database was updated
        const verifyClient = await pool.connect();
        const verifyResult = await verifyClient.query(
          'SELECT password_hash IS NOT NULL as has_password FROM member_authentication WHERE member_id = $1',
          [member.id]
        );

        if (verifyResult.rows.length > 0) {
          const hasPassword = verifyResult.rows[0].has_password;
          console.log(`🔐 Database verification - Password hash updated: ${hasPassword ? 'SUCCESS ✅' : 'FAILED ❌'}`);
        }

        verifyClient.release();

      } else {
        console.log('❌ Password reset failed with status:', resetResult.statusCode);
      }

    } catch (connError) {
      console.log('⚠️ Server not running or connection issue:', connError.message);
      console.log('💡 Please run `cd server && node index.js` first, then re-run this test');
    }

    await pool.end();

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPasswordResetDirectly();
