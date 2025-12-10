// Migration script to update member_payments table for existing database
// Run with: node server/migrations/add_member_fees_table.js

import pool from '../lib/db.js';

async function migrate() {
  try {
    console.log('🚀 Starting migration: Updating member_payments table...');

    // Check if new columns already exist
    const checkColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'member_payments' 
      AND column_name = 'fee_type';
    `);

    if (checkColumns.rows.length > 0) {
      console.log('⚠️  member_payments table already has the new columns. Skipping column additions.');
    } else {
      // Add new columns to member_payments
      console.log('📝 Adding new columns to member_payments...');

      await pool.query(`ALTER TABLE member_payments ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);`);
      await pool.query(`ALTER TABLE member_payments ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);`);
      await pool.query(`ALTER TABLE member_payments ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2);`);
      await pool.query(`ALTER TABLE member_payments ADD COLUMN IF NOT EXISTS fee_type VARCHAR(50);`);
      await pool.query(`ALTER TABLE member_payments ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES admins(id);`);
      await pool.query(`ALTER TABLE member_payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`);

      // Make proof_of_payment_path nullable (was NOT NULL before)
      await pool.query(`ALTER TABLE member_payments ALTER COLUMN proof_of_payment_path DROP NOT NULL;`);

      // Add check constraint for fee_type
      await pool.query(`
        ALTER TABLE member_payments 
        ADD CONSTRAINT chk_fee_type 
        CHECK (fee_type IN ('application_fee', 'renewal_fee'));
      `);

      console.log('✅ New columns added successfully!');
    }

    // Create indexes if they don't exist
    console.log('📝 Creating indexes...');
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_member_payments_member_id ON member_payments(member_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_member_payments_fee_type ON member_payments(fee_type);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_member_payments_payment_date ON member_payments(payment_date DESC);`);
    console.log('✅ Indexes created!');

    // Update membership_categories to have consistent P50/P150 fees for all members
    console.log('📝 Updating membership_categories fees...');
    await pool.query(`
      UPDATE membership_categories 
      SET joining_fee = 50.00, annual_fee = 150.00
      WHERE category_type IN ('professional', 'student');
    `);
    console.log('✅ Membership fees updated: P50 joining, P150 annual for all members');

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
