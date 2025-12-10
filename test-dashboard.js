const fetch = require('node-fetch');

// Test the dashboard stats endpoint
async function testDashboardStats() {
    try {
        // First, let's check if we can connect to the server
        const response = await fetch('http://localhost:3001/api/admin/dashboard-stats', {
            headers: {
                'Authorization': 'Bearer test-token'
            }
        });

        console.log('Response Status:', response.status);
        console.log('Response Headers:', response.headers.raw());

        const data = await response.json();
        console.log('Response Data:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error testing dashboard stats:', error.message);
    }
}

testDashboardStats();
