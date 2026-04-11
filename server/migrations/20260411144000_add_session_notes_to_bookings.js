import pool from '../lib/db.js';

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration: Adding session_notes column to bookings...');
    
    // Check if column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      AND column_name = 'session_notes';
    `;
    const res = await client.query(checkColumnQuery);
    
    if (res.rows.length === 0) {
      await client.query(`
        ALTER TABLE bookings 
        ADD COLUMN session_notes TEXT;
      `);
      console.log('Column session_notes added successfully.');
    } else {
      console.log('Column session_notes already exists.');
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
