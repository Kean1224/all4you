// Quick test to check if frontend is using correct backend URL
console.log('=== ENVIRONMENT DEBUG ===');
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('Expected: https://api.all4youauctions.co.za');
console.log('Current NODE_ENV:', process.env.NODE_ENV);

// Test the API endpoint that's failing
async function testAdminLogin() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.all4youauctions.co.za';
  const endpoint = `${apiUrl}/api/auth/admin-login`;
  
  console.log('Testing endpoint:', endpoint);
  
  try {
    const response = await fetch(endpoint, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://www.all4youauctions.co.za'
      }
    });
    console.log('CORS test response:', response.status);
    return response.status === 204 ? 'SUCCESS' : 'FAILED';
  } catch (error) {
    console.error('CORS test failed:', error);
    return 'ERROR: ' + error.message;
  }
}

// Auto-run test
if (typeof window !== 'undefined') {
  testAdminLogin().then(result => {
    console.log('CORS Test Result:', result);
  });
}
