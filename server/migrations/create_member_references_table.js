import pool from '../lib/db.js';

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration: Creating member_references table...');
    
    await client.query('BEGIN');

    // 1. Create the table
    await client.query(`
      CREATE TABLE IF NOT EXISTS member_references (
        id SERIAL PRIMARY KEY,
        member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        file_path VARCHAR(500) NOT NULL,
        original_filename VARCHAR(255),
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table member_references created or already exists.');

    // 2. Migrate existing data
    const migrationQuery = `
      INSERT INTO member_references (member_id, file_path, original_filename)
      SELECT member_id, references_path, 'Reference_Legacy.pdf'
      FROM member_personal_documents
      WHERE references_path IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM member_references WHERE member_id = member_personal_documents.member_id
      );
    `;
    const res = await client.query(migrationQuery);
    console.log(`Migrated ${res.rowCount} existing references.`);

    await client.query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    process.exit();
  }
}

migrate();
