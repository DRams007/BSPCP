import pool from './server/lib/db.js';

async function testTestimonialsEndpoint() {
  try {
    console.log('🔍 Testing testimonials endpoint...\n');

    // Test 1: Database connection
    console.log('1️⃣ Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connection successful\n');

    // Test 2: Check if testimonials table exists
    console.log('2️⃣ Checking if testimonials table exists...');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name = 'testimonials'
    `);

    if (tablesResult.rows.length === 0) {
      console.log('❌ Testimonials table does not exist\n');
      client.release();
      return;
    }
    console.log('✅ Testimonials table exists\n');

    // Test 3: Check table structure
    console.log('3️⃣ Checking testimonials table structure...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'testimonials'
      ORDER BY ordinal_position
    `);

    console.log('📋 Table columns:');
    columnsResult.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    console.log('');

    // Test 4: Check if there's any data in the table
    console.log('4️⃣ Checking current testimonials data...');
    const dataResult = await client.query('SELECT COUNT(*) as count FROM testimonials');
    const dataCount = parseInt(dataResult.rows[0].count, 10);
    console.log(`📊 Current testimonials count: ${dataCount}\n`);

    if (dataCount > 0) {
      // Show sample data if available
      console.log('📝 Sample testimonials (last 2):');
      const sampleResult = await client.query(`
        SELECT id, name, email, role, rating, status, anonymous, left(content, 50) as content_preview, created_at
        FROM testimonials
        ORDER BY created_at DESC
        LIMIT 2
      `);

      sampleResult.rows.forEach((testimonial, index) => {
        console.log(`${index + 1}. Name: ${testimonial.name}`);
        console.log(`   Email: ${testimonial.anonymous ? '[HIDDEN]' : testimonial.email}`);
        console.log(`   Role: ${testimonial.role || 'N/A'}`);
        console.log(`   Rating: ${testimonial.rating}`);
        console.log(`   Status: ${testimonial.status}`);
        console.log(`   Content: ${testimonial.content_preview}...`);
        console.log(`   Created: ${testimonial.created_at}`);
        console.log('');
      });
    } else {
      console.log('ℹ️ No testimonials data found in table\n');

      // Insert some test data
      console.log('🧪 Inserting test testimonials for debugging...');
      try {
        await client.query(`
          INSERT INTO testimonials (name, email, role, content, rating, anonymous, status)
          VALUES
            ('Test User 1', 'test1@example.com', 'Counsellor', 'This is a test testimonial with a great rating!', 5, false, 'approved'),
            ('Test User 2', 'test2@example.com', 'Client', 'Another test testimonial with good feedback.', 4, false, 'approved'),
            ('Anonymous User', 'anon@example.com', 'Professional', 'Anonymous feedback for testing purposes.', 3, true, 'pending')
        `);
        console.log('✅ Test testimonials inserted successfully\n');
      } catch (insertError) {
        console.log('❌ Failed to insert test testimonials:', insertError.message, '\n');
      }
    }

    // Test 5: Simulate the API query with status filter
    console.log('5️⃣ Testing API query simulation...');
    const { status: queryStatus } = { status: 'approved' }; // Simulating the query param

    let apiQuery = 'SELECT id, name, email, role, content, rating, anonymous, status, created_at AS submitted_date FROM testimonials WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (queryStatus && queryStatus !== 'all') {
      apiQuery += ` AND status ILIKE $${paramIndex}`;
      queryParams.push(queryStatus);
      paramIndex++;
    }

    apiQuery += ' ORDER BY created_at DESC';

    console.log('🔍 API Query:', apiQuery);
    console.log('🔍 Query Params:', queryParams);

    const apiResult = await client.query(apiQuery, queryParams);
    console.log(`✅ API Query successful - returned ${apiResult.rows.length} testimonials\n`);

    if (apiResult.rows.length > 0) {
      console.log('📋 Testimonials returned by API query:');
      apiResult.rows.forEach((testimonial, index) => {
        console.log(`${index + 1}. ID: ${testimonial.id}`);
        console.log(`   Name: ${testimonial.name}`);
        console.log(`   Status: ${testimonial.status}`);
        console.log(`   Created: ${testimonial.submitted_date}`);
        console.log('');
      });
    }

    client.release();

    console.log('🏁 Testimonials endpoint test completed successfully!');
    console.log('\n💡 If you still get 500 errors, check:');
    console.log('   - PostgreSQL service is running');
    console.log('   - Database credentials are correct');
    console.log('   - Server is running on port 3001');
    console.log('   - Network/firewall issues blocking connection');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code) console.error('💥 Error code:', error.code);
    if (error.detail) console.error('📝 Error detail:', error.detail);
    if (error.hint) console.error('💡 Error hint:', error.hint);
  } finally {
    await pool.end();
  }
}

testTestimonialsEndpoint();
