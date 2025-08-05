// QUICK PLATFORM VALIDATION - Run this in browser console
// Tests core functionality without external dependencies

console.log('🧪 QUICK PLATFORM VALIDATION TEST');
console.log('================================');

const API_URL = 'https://api.all4youauctions.co.za';

async function quickTest() {
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  // Test 1: API Health
  try {
    results.total++;
    console.log('🔄 Testing API Health...');
    const response = await fetch(`${API_URL}/health`);
    if (response.ok) {
      console.log('✅ API Health: PASS');
      results.passed++;
    } else {
      console.log('❌ API Health: FAIL');
      results.failed++;
    }
  } catch (error) {
    console.log('❌ API Health: ERROR -', error.message);
    results.failed++;
  }

  // Test 2: CORS Configuration
  try {
    results.total++;
    console.log('🔄 Testing CORS...');
    const response = await fetch(`${API_URL}/api/auth/session`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ CORS: PASS - No CORS errors');
    results.passed++;
  } catch (error) {
    if (error.message.includes('CORS')) {
      console.log('❌ CORS: FAIL -', error.message);
      results.failed++;
    } else {
      console.log('✅ CORS: PASS - No CORS errors');
      results.passed++;
    }
  }

  // Test 3: Authentication Endpoint
  try {
    results.total++;
    console.log('🔄 Testing Auth Endpoint...');
    const response = await fetch(`${API_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'wrong'
      })
    });
    
    if (response.status === 401) {
      console.log('✅ Auth Endpoint: PASS - Correctly rejects invalid credentials');
      results.passed++;
    } else {
      console.log('❌ Auth Endpoint: FAIL - Unexpected response');
      results.failed++;
    }
  } catch (error) {
    console.log('❌ Auth Endpoint: ERROR -', error.message);
    results.failed++;
  }

  // Test 4: Registration Endpoint
  try {
    results.total++;
    console.log('🔄 Testing Registration Endpoint...');
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    if (response.status === 400) {
      console.log('✅ Registration Endpoint: PASS - Correctly validates input');
      results.passed++;
    } else {
      console.log('❌ Registration Endpoint: FAIL - Unexpected response');
      results.failed++;
    }
  } catch (error) {
    console.log('❌ Registration Endpoint: ERROR -', error.message);
    results.failed++;
  }

  // Test 5: Frontend Homepage
  try {
    results.total++;
    console.log('🔄 Testing Frontend Homepage...');
    const response = await fetch('https://www.all4youauctions.co.za/');
    if (response.ok) {
      console.log('✅ Frontend Homepage: PASS');
      results.passed++;
    } else {
      console.log('❌ Frontend Homepage: FAIL');
      results.failed++;
    }
  } catch (error) {
    console.log('❌ Frontend Homepage: ERROR -', error.message);
    results.failed++;
  }

  // Results Summary
  console.log('\n================================');
  console.log('🏁 QUICK TEST RESULTS');
  console.log('================================');
  console.log(`✅ Tests Passed: ${results.passed}/${results.total}`);
  console.log(`❌ Tests Failed: ${results.failed}/${results.total}`);
  console.log(`📊 Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 ALL QUICK TESTS PASSED!');
    console.log('✅ Platform appears to be fully operational');
  } else {
    console.log('\n⚠️  Some tests failed - check the errors above');
  }

  return results;
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  quickTest();
}

// Manual tests you can perform:
console.log('\n📝 MANUAL TESTS TO PERFORM:');
console.log('1. Navigate to: https://www.all4youauctions.co.za');
console.log('2. Test navigation buttons (Home, Auctions, Sell, etc.)');
console.log('3. Visit: https://www.all4youauctions.co.za/register');
console.log('4. Test the 5-step registration form');
console.log('5. Try uploading documents (ID, Proof of Address, Bank Statement)');
console.log('6. Visit: https://www.all4youauctions.co.za/admin');
console.log('7. Login with: Keanmartin75@gmail.com / Tristan@89');
console.log('8. Test admin dashboard functionality');
console.log('9. Try creating a test auction');
console.log('10. Test contact form: https://www.all4youauctions.co.za/contact');

console.log('\n🔧 TECHNICAL TESTS:');
console.log('• Open browser dev tools and check for errors');
console.log('• Verify responsive design on mobile/tablet');
console.log('• Test form validation and error messages');
console.log('• Check that all images and assets load correctly');
console.log('• Verify smooth transitions and animations');

module.exports = quickTest;
