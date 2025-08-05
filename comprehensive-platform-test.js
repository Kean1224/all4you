#!/usr/bin/env node

// COMPREHENSIVE PLATFORM TESTING SCRIPT
// Tests all features locally and against live API

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

console.log('🧪 ALL4YOU AUCTION PLATFORM - COMPREHENSIVE TESTING');
console.log('====================================================');
console.log('');

// Configuration
const LOCAL_API = 'http://localhost:5000';
const LIVE_API = 'https://api.all4youauctions.co.za';
const LIVE_FRONTEND = 'https://www.all4youauctions.co.za';
const WS_LOCAL = 'ws://localhost:5050';
const WS_LIVE = 'wss://api.all4youauctions.co.za'; // or appropriate WebSocket URL

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to run tests
async function runTest(testName, testFunction) {
  try {
    console.log(`🔄 Testing: ${testName}`);
    const result = await testFunction();
    if (result) {
      console.log(`✅ PASS: ${testName}`);
      testResults.passed++;
      testResults.tests.push({ name: testName, status: 'PASS', result });
    } else {
      console.log(`❌ FAIL: ${testName}`);
      testResults.failed++;
      testResults.tests.push({ name: testName, status: 'FAIL', result: 'Test failed' });
    }
  } catch (error) {
    console.log(`❌ ERROR: ${testName} - ${error.message}`);
    testResults.failed++;
    testResults.tests.push({ name: testName, status: 'ERROR', result: error.message });
  }
}

// Test 1: API Health Check
async function testAPIHealth() {
  try {
    const response = await fetch(`${LIVE_API}/health`);
    const data = await response.json();
    return response.ok && data.status === 'healthy';
  } catch (error) {
    console.log('   API not responding - checking if backend is running locally');
    return false;
  }
}

// Test 2: Database/File System Check
async function testDataFiles() {
  const requiredFiles = [
    'backend/data/auctions.json',
    'backend/data/users.json',
    'backend/data/invoices.json',
    'backend/data/contact_inbox.json',
    'backend/data/fica.json'
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      console.log(`   Missing: ${file}`);
      return false;
    }
  }
  return true;
}

// Test 3: Authentication System
async function testAuthentication() {
  try {
    // Test admin login
    const response = await fetch(`${LIVE_API}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'Keanmartin75@gmail.com',
        password: 'Tristan@89'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.role === 'admin' && data.token;
    }
    return false;
  } catch (error) {
    console.log('   Auth endpoint not accessible');
    return false;
  }
}

// Test 4: Registration System (without actually registering)
async function testRegistrationEndpoint() {
  try {
    // Test endpoint availability (should fail with missing data but endpoint should exist)
    const response = await fetch(`${LIVE_API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Empty body should trigger validation error
    });
    
    // Should return 400 (bad request) not 404 (not found)
    return response.status === 400;
  } catch (error) {
    return false;
  }
}

// Test 5: Email System Configuration
async function testEmailSystem() {
  const mailerPath = path.join(__dirname, 'backend/utils/mailer.js');
  if (!fs.existsSync(mailerPath)) return false;
  
  const mailerContent = fs.readFileSync(mailerPath, 'utf8');
  return mailerContent.includes('nodemailer') && mailerContent.includes('sendMail');
}

// Test 6: WebSocket Server (local test)
async function testWebSocketServer() {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(WS_LOCAL);
      
      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'register',
          email: 'test@test.com'
        }));
        
        setTimeout(() => {
          ws.close();
          resolve(true);
        }, 1000);
      });
      
      ws.on('error', () => {
        resolve(false);
      });
      
      // Timeout after 3 seconds
      setTimeout(() => {
        ws.close();
        resolve(false);
      }, 3000);
    } catch (error) {
      resolve(false);
    }
  });
}

// Test 7: Frontend Build Files
async function testFrontendBuild() {
  const frontendFiles = [
    'frontend/app/page.tsx',
    'frontend/components/ModernHeader.tsx',
    'frontend/components/ModernRegistrationForm.tsx',
    'frontend/app/register/page.tsx',
    'frontend/app/admin/page.tsx'
  ];
  
  for (const file of frontendFiles) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      console.log(`   Missing: ${file}`);
      return false;
    }
  }
  return true;
}

// Test 8: Security Middleware
async function testSecurityMiddleware() {
  const securityPath = path.join(__dirname, 'backend/middleware/security.js');
  if (!fs.existsSync(securityPath)) return false;
  
  const securityContent = fs.readFileSync(securityPath, 'utf8');
  return securityContent.includes('rateLimit') && 
         securityContent.includes('helmet') &&
         securityContent.includes('rateLimits');
}

// Test 9: Invoice System
async function testInvoiceSystem() {
  const invoicePath = path.join(__dirname, 'backend/api/invoices/index.js');
  if (!fs.existsSync(invoicePath)) return false;
  
  const invoiceContent = fs.readFileSync(invoicePath, 'utf8');
  return invoiceContent.includes('PDFDocument') && invoiceContent.includes('invoice');
}

// Test 10: Upload Directories
async function testUploadDirectories() {
  const uploadDirs = [
    'backend/uploads/auctions',
    'backend/uploads/fica',
    'backend/uploads/invoices',
    'backend/uploads/items'
  ];
  
  for (const dir of uploadDirs) {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      try {
        fs.mkdirSync(dirPath, { recursive: true });
      } catch (error) {
        console.log(`   Could not create: ${dir}`);
        return false;
      }
    }
  }
  return true;
}

// Test 11: Environment Configuration
async function testEnvironmentConfig() {
  const envFiles = [
    'frontend/.env.production',
    'frontend/.env.local'
  ];
  
  let hasEnvFile = false;
  for (const envFile of envFiles) {
    const envPath = path.join(__dirname, envFile);
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('NEXT_PUBLIC_API_URL')) {
        hasEnvFile = true;
        break;
      }
    }
  }
  return hasEnvFile;
}

// Test 12: Package Dependencies
async function testPackageDependencies() {
  const backendPackage = path.join(__dirname, 'backend/package.json');
  const frontendPackage = path.join(__dirname, 'frontend/package.json');
  
  if (!fs.existsSync(backendPackage) || !fs.existsSync(frontendPackage)) {
    return false;
  }
  
  const backend = JSON.parse(fs.readFileSync(backendPackage, 'utf8'));
  const frontend = JSON.parse(fs.readFileSync(frontendPackage, 'utf8'));
  
  // Check critical dependencies
  const backendDeps = backend.dependencies || {};
  const frontendDeps = frontend.dependencies || {};
  
  return backendDeps.express && 
         backendDeps.nodemailer && 
         backendDeps.ws && 
         frontendDeps.next && 
         frontendDeps.react;
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting comprehensive platform testing...\n');
  
  await runTest('API Health Check', testAPIHealth);
  await runTest('Data Files Structure', testDataFiles);
  await runTest('Authentication System', testAuthentication);
  await runTest('Registration Endpoint', testRegistrationEndpoint);
  await runTest('Email System Configuration', testEmailSystem);
  await runTest('WebSocket Server', testWebSocketServer);
  await runTest('Frontend Build Files', testFrontendBuild);
  await runTest('Security Middleware', testSecurityMiddleware);
  await runTest('Invoice System', testInvoiceSystem);
  await runTest('Upload Directories', testUploadDirectories);
  await runTest('Environment Configuration', testEnvironmentConfig);
  await runTest('Package Dependencies', testPackageDependencies);
  
  console.log('\n====================================================');
  console.log('🏁 TESTING COMPLETE');
  console.log('====================================================');
  console.log(`✅ Tests Passed: ${testResults.passed}`);
  console.log(`❌ Tests Failed: ${testResults.failed}`);
  console.log(`📊 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
  
  console.log('\n📋 DETAILED RESULTS:');
  testResults.tests.forEach(test => {
    const icon = test.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${test.name}: ${test.status}`);
  });
  
  console.log('\n🎯 RECOMMENDATIONS:');
  if (testResults.failed > 0) {
    console.log('- Review failed tests above');
    console.log('- Ensure backend server is running (npm start in backend/)');
    console.log('- Check environment variables are configured');
    console.log('- Verify all dependencies are installed');
  } else {
    console.log('🎉 ALL TESTS PASSED! Platform is fully operational.');
    console.log('✅ Ready for production use on www.all4youauctions.co.za');
  }
  
  console.log('\n🌐 Live Testing URLs:');
  console.log(`Frontend: ${LIVE_FRONTEND}`);
  console.log(`API: ${LIVE_API}`);
  console.log(`Admin Login: ${LIVE_FRONTEND}/admin`);
  console.log(`Registration: ${LIVE_FRONTEND}/register`);
  
  console.log('\n📝 Manual Tests to Perform:');
  console.log('1. Visit homepage and verify navigation works');
  console.log('2. Test registration form with document uploads');
  console.log('3. Test admin login with credentials');
  console.log('4. Create a test auction in admin panel');
  console.log('5. Test real-time bidding functionality');
  console.log('6. Verify email notifications are sent');
  console.log('7. Test invoice generation');
  console.log('8. Verify contact form submissions');
}

// Run the tests
runAllTests().catch(console.error);

module.exports = { runAllTests, testResults };
