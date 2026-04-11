import pool from '../lib/db.js';

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration: Restoring missing professional fields...');
    
    await client.query('BEGIN');

    // 1. Add other_qualifications to member_professional_details if it doesn't exist
    const checkOtherQuals = `
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'member_professional_details' AND column_name = 'other_qualifications';
    `;
    const otherQualsRes = await client.query(checkOtherQuals);
    if (otherQualsRes.rows.length === 0) {
      await client.query('ALTER TABLE member_professional_details ADD COLUMN other_qualifications TEXT;');
      console.log('Added other_qualifications column to member_professional_details table.');
    }

    // 2. Add scholarly_publications to member_professional_details if it doesn't exist
    const checkPubs = `
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'member_professional_details' AND column_name = 'scholarly_publications';
    `;
    const pubsRes = await client.query(checkPubs);
    if (pubsRes.rows.length === 0) {
      await client.query('ALTER TABLE member_professional_details ADD COLUMN scholarly_publications TEXT;');
      console.log('Added scholarly_publications column to member_professional_details table.');
    }

    await client.query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    if (client) client.release();
    process.exit();
  }
}

migrate();
