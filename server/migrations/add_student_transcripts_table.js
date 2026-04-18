// Migration script to create student_transcripts table for multi-file transcript uploads
import pool from '../lib/db.js';

async function migrate() {
  try {
    console.log('🚀 Starting migration: Creating student_transcripts table...');

    // Check if table already exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'student_transcripts'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('⚠️  student_transcripts table already exists. Skipping.');
    } else {
      console.log('📝 Creating student_transcripts table...');
      await pool.query(`
        CREATE TABLE student_transcripts (
          id SERIAL PRIMARY KEY,
          member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
          file_path VARCHAR(500) NOT NULL,
          original_filename VARCHAR(255),
          uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ student_transcripts table created successfully.');

      // Create index for performance
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_student_transcripts_member_id ON student_transcripts(member_id);`);
      console.log('✅ Index created on student_transcripts(member_id).');
    }

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrate();
