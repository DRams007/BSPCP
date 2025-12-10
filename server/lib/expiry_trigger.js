import pool from './db.js';

async function checkAndExpireMemberships() {
  console.log('Running daily check for expired memberships...');
  const client = await pool.connect();
  try {
    const today = new Date();
    const result = await client.query(
      `UPDATE members
       SET member_status = 'expired'
       WHERE renewal_date < $1
         AND member_status = 'active'`,
      [today]
    );
    if (result.rowCount > 0) {
      console.log(`Expired ${result.rowCount} members.`);
    } else {
      console.log('No members to expire.');
    }
  } catch (err) {
    console.error('Error expiring members:', err);
  } finally {
    client.release();
  }
}

export default checkAndExpireMemberships;