// Migration script to add police_clearance_path to member_personal_documents table
// Run with: node server/migrations/add_police_clearance_to_documents.js

import pool from '../lib/db.js';

async function migrate() {
  try {
    console.log('🚀 Starting migration: Adding police_clearance_path to member_personal_documents...');

    // Check if column already exists
    const checkColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'member_personal_documents' 
      AND column_name = 'police_clearance_path';
    `);

    if (checkColumns.rows.length > 0) {
      console.log('⚠️  member_personal_documents table already has police_clearance_path. Skipping.');
    } else {
      console.log('📝 Adding police_clearance_path to member_personal_documents...');
      await pool.query(`ALTER TABLE member_personal_documents ADD COLUMN IF NOT EXISTS police_clearance_path VARCHAR(500);`);
      console.log('✅ Column added successfully!');
    }

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
