// Simple test script for enhanced login functionality
const http = require('http');

const BASE_URL = 'http://localhost:3001';

const testCases = [
  { name: 'Alice Smith (Active) - Username', identifier: 'asmith', password: 'testpassword123', expected: 'success' },
  { name: 'Alice Smith (Active) - Email', identifier: 'alice.smith@example.com', password: 'testpassword123', expected: 'success' },
  { name: 'Bob Johnson (Pending)', identifier: 'bjohnson', password: 'testpassword123', expected: 'forbidden' },
  { name: 'Non-existent user', identifier: 'nonexistent', password: 'password', expected: 'invalid' },
];

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/member/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, body: jsonBody });
        } catch (error) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', (error) => reject(error));
    req.write(postData);
    req.end();
  });
}

async function testLogin(testCase) {
  console.log(`\n🔍 Testing: ${testCase.name}`);
  console.log(`➡️  Identifier: ${testCase.identifier}`);

  try {
    const response = await makeRequest({
      identifier: testCase.identifier,
      password: testCase.password,
    });

    if (testCase.expected === 'success' && response.status === 200) {
      console.log(`✅ PASS: Login successful for ${testCase.identifier}`);
      console.log(`➡️  Member: ${response.body.fullName}`);
    } else if (testCase.expected === 'forbidden' && response.status === 403) {
      console.log(`✅ PASS: Correctly blocked pending member ${testCase.identifier}`);
      console.log(`➡️  Error: ${response.body.error}`);
    } else if (testCase.expected === 'invalid' && response.status === 401) {
      console.log(`✅ PASS: Correctly blocked invalid credentials for ${testCase.identifier}`);
      console.log(`➡️  Error: ${response.body.error}`);
    } else {
      console.log(`❌ FAIL: Unexpected response for ${testCase.identifier}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${response.body.error || response.body}`);
      console.log(`   Expected: ${testCase.expected}`);
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Testing Enhanced Login System');
  console.log('================================');
  console.log('📋 Testing email/username login + approval system...\n');

  for (const testCase of testCases) {
    await testLogin(testCase);
  }

  console.log('\n🎉 Testing Complete!');
  console.log('\n📖 Expected Results Summary:');
  console.log('✅ Alice Smith: Should login with BOTH username (asmith) AND email (alice.smith@example.com)');
  console.log('❌ Bob Johnson: Should be blocked (pending approval)');
  console.log('❌ Non-existent: Should fail (invalid credentials)');
}

runTests().catch(console.error);
