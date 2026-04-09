import pool from '../lib/db.js';

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration: Adding other_specialization column...');
    
    // Check if column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'member_professional_details' 
      AND column_name = 'other_specialization';
    `;
    const res = await client.query(checkColumnQuery);
    
    if (res.rows.length === 0) {
      await client.query(`
        ALTER TABLE member_professional_details 
        ADD COLUMN other_specialization TEXT;
      `);
      console.log('Column other_specialization added successfully.');
    } else {
      console.log('Column other_specialization already exists.');
    }
    
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    client.release();
    process.exit();
  }
}

migrate();
