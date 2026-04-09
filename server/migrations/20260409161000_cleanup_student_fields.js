import pool from '../lib/db.js';

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration: Student fields cleanup and program_name addition...');
    
    await client.query('BEGIN');

    // 1. Add program_name if it doesn't exist
    const checkProgramName = `
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'members' AND column_name = 'program_name';
    `;
    const programNameRes = await client.query(checkProgramName);
    if (programNameRes.rows.length === 0) {
      await client.query('ALTER TABLE members ADD COLUMN program_name VARCHAR(255);');
      console.log('Added program_name column to members table.');
    }

    // 2. Data migration: Copy counselling_coursework to program_name
    const checkCoursework = `
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'members' AND column_name = 'counselling_coursework';
    `;
    const courseworkRes = await client.query(checkCoursework);
    if (courseworkRes.rows.length > 0) {
      await client.query('UPDATE members SET program_name = counselling_coursework WHERE program_name IS NULL AND counselling_coursework IS NOT NULL;');
      console.log('Migrated data from counselling_coursework to program_name.');
    }

    // 3. Drop unnecessary columns from members
    const columnsToDropMembers = [
      'counselling_coursework',
      'internship_supervisor_license',
      'supervised_practice_hours'
    ];

    for (const col of columnsToDropMembers) {
      const checkCol = `
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'members' AND column_name = $1;
      `;
      const res = await client.query(checkCol, [col]);
      if (res.rows.length > 0) {
        await client.query(`ALTER TABLE members DROP COLUMN ${col};`);
        console.log(`Dropped column ${col} from members table.`);
      }
    }

    // 4. Drop unnecessary columns from member_professional_details
    const columnsToDropProf = [
      'scholarly_publications',
      'other_qualifications'
    ];

    for (const col of columnsToDropProf) {
      const checkCol = `
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'member_professional_details' AND column_name = $1;
      `;
      const res = await client.query(checkCol, [col]);
      if (res.rows.length > 0) {
        await client.query(`ALTER TABLE member_professional_details DROP COLUMN ${col};`);
        console.log(`Dropped column ${col} from member_professional_details table.`);
      }
    }

    await client.query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    process.exit();
  }
}

migrate();
