async function simulateForgotPassword(testEmail) {
  const baseUrl = 'http://localhost:3001';

  console.log(`🔄 Simulating password reset request for email: ${testEmail}`);
  console.log('📧 Token will be logged in server console (check terminal running server)');
  console.log('='.repeat(60));

  try {
    const response = await fetch(`${baseUrl}/api/member/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Password reset simulation completed!');
      console.log('📝 Response:', result.message);
      console.log('');
      console.log('🔍 Check your server terminal logs for:');
      console.log('   - Generated reset token (JWT)');
      console.log('   - Simulated email content');
      console.log('   - Complete reset link URL');
      console.log('');
      console.log('💡 To use the reset token:');
      console.log('   - Copy the token from server logs');
      console.log('   - Use it with the /api/member/reset-password endpoint');

      // Example usage
      console.log('');
      console.log('Example reset endpoint usage:');
      console.log(`POST http://localhost:3001/api/member/reset-password`);
      console.log(`Body: { "token": "<copy-token-from-logs>", "newPassword": "YourNewPassword123" }`);

    } else {
      console.log('❌ Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    console.log('💡 Make sure your server is running on port 3001');
  }
}

// Check if a specific email was provided as command line argument
const providedEmail = process.argv[2];
const emailToUse = providedEmail || 'test@example.com'; // Default email for testing

if (providedEmail) {
  console.log(`📧 Using provided email: ${providedEmail}`);
} else {
  console.log('📧 No email provided, using default: test@example.com');
  console.log('💡 Tip: To use a specific email, run: node simulate-password-reset.js user@example.com');
}

simulateForgotPassword(emailToUse);
