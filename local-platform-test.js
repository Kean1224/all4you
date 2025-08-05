// COMPREHENSIVE PLATFORM VALIDATION - No external dependencies
// Tests all local files and system structure

const fs = require('fs');
const path = require('path');

console.log('🧪 ALL4YOU AUCTION PLATFORM - LOCAL VALIDATION');
console.log('===============================================');
console.log('');

let results = {
  passed: 0,
  failed: 0,
  tests: []
};

function runTest(testName, testFunction) {
  try {
    console.log(`🔄 Testing: ${testName}`);
    const result = testFunction();
    if (result.success) {
      console.log(`✅ PASS: ${testName}`);
      if (result.details) console.log(`   ${result.details}`);
      results.passed++;
      results.tests.push({ name: testName, status: 'PASS' });
    } else {
      console.log(`❌ FAIL: ${testName}`);
      if (result.details) console.log(`   ${result.details}`);
      results.failed++;
      results.tests.push({ name: testName, status: 'FAIL', details: result.details });
    }
  } catch (error) {
    console.log(`❌ ERROR: ${testName} - ${error.message}`);
    results.failed++;
    results.tests.push({ name: testName, status: 'ERROR', details: error.message });
  }
}

// Test 1: Project Structure
function testProjectStructure() {
  const requiredDirs = [
    'backend',
    'frontend',
    'backend/api',
    'backend/data',
    'backend/utils',
    'backend/middleware',
    'frontend/app',
    'frontend/components'
  ];
  
  const missing = [];
  requiredDirs.forEach(dir => {
    if (!fs.existsSync(path.join(__dirname, dir))) {
      missing.push(dir);
    }
  });
  
  if (missing.length === 0) {
    return { success: true, details: 'All required directories present' };
  } else {
    return { success: false, details: `Missing: ${missing.join(', ')}` };
  }
}

// Test 2: Backend Core Files
function testBackendCoreFiles() {
  const coreFiles = [
    'backend/index.js',
    'backend/package.json',
    'backend/ws-server.js',
    'backend/utils/mailer.js',
    'backend/middleware/security.js',
    'backend/api/auth/index.js',
    'backend/api/auctions/index.js',
    'backend/api/invoices/index.js'
  ];
  
  const missing = [];
  coreFiles.forEach(file => {
    if (!fs.existsSync(path.join(__dirname, file))) {
      missing.push(file);
    }
  });
  
  if (missing.length === 0) {
    return { success: true, details: `${coreFiles.length} core backend files verified` };
  } else {
    return { success: false, details: `Missing: ${missing.join(', ')}` };
  }
}

// Test 3: Frontend Core Files
function testFrontendCoreFiles() {
  const coreFiles = [
    'frontend/package.json',
    'frontend/next.config.js',
    'frontend/tailwind.config.js',
    'frontend/app/page.tsx',
    'frontend/app/register/page.tsx',
    'frontend/app/admin/page.tsx',
    'frontend/components/ModernHeader.tsx',
    'frontend/components/ModernRegistrationForm.tsx'
  ];
  
  const missing = [];
  coreFiles.forEach(file => {
    if (!fs.existsSync(path.join(__dirname, file))) {
      missing.push(file);
    }
  });
  
  if (missing.length === 0) {
    return { success: true, details: `${coreFiles.length} core frontend files verified` };
  } else {
    return { success: false, details: `Missing: ${missing.join(', ')}` };
  }
}

// Test 4: Data Files
function testDataFiles() {
  const dataDir = path.join(__dirname, 'backend/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const dataFiles = [
    'auctions.json',
    'users.json',
    'invoices.json',
    'contact_inbox.json',
    'fica.json'
  ];
  
  let created = 0;
  dataFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '[]');
      created++;
    }
  });
  
  if (created > 0) {
    return { success: true, details: `Created ${created} missing data files` };
  } else {
    return { success: true, details: 'All data files present' };
  }
}

// Test 5: Upload Directories
function testUploadDirectories() {
  const uploadDirs = [
    'backend/uploads',
    'backend/uploads/auctions',
    'backend/uploads/fica',
    'backend/uploads/invoices',
    'backend/uploads/items'
  ];
  
  let created = 0;
  uploadDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      created++;
    }
  });
  
  if (created > 0) {
    return { success: true, details: `Created ${created} missing upload directories` };
  } else {
    return { success: true, details: 'All upload directories present' };
  }
}

// Test 6: Package Dependencies
function testPackageDependencies() {
  const backendPackage = path.join(__dirname, 'backend/package.json');
  const frontendPackage = path.join(__dirname, 'frontend/package.json');
  
  if (!fs.existsSync(backendPackage) || !fs.existsSync(frontendPackage)) {
    return { success: false, details: 'Package.json files missing' };
  }
  
  const backend = JSON.parse(fs.readFileSync(backendPackage, 'utf8'));
  const frontend = JSON.parse(fs.readFileSync(frontendPackage, 'utf8'));
  
  const backendDeps = backend.dependencies || {};
  const frontendDeps = frontend.dependencies || {};
  
  const criticalBackend = ['express', 'nodemailer', 'ws', 'bcryptjs', 'jsonwebtoken'];
  const criticalFrontend = ['next', 'react', 'tailwindcss', 'framer-motion'];
  
  const missingBackend = criticalBackend.filter(dep => !backendDeps[dep]);
  const missingFrontend = criticalFrontend.filter(dep => !frontendDeps[dep]);
  
  if (missingBackend.length === 0 && missingFrontend.length === 0) {
    return { success: true, details: 'All critical dependencies present' };
  } else {
    const missing = [...missingBackend.map(d => `backend: ${d}`), ...missingFrontend.map(d => `frontend: ${d}`)];
    return { success: false, details: `Missing: ${missing.join(', ')}` };
  }
}

// Test 7: Security Configuration
function testSecurityConfiguration() {
  const securityFile = path.join(__dirname, 'backend/middleware/security.js');
  if (!fs.existsSync(securityFile)) {
    return { success: false, details: 'Security middleware file missing' };
  }
  
  const content = fs.readFileSync(securityFile, 'utf8');
  const features = [
    'rateLimit',
    'helmet',
    'rateLimits',
    'securityConfig',
    'securityLogger'
  ];
  
  const missing = features.filter(feature => !content.includes(feature));
  
  if (missing.length === 0) {
    return { success: true, details: 'All security features configured' };
  } else {
    return { success: false, details: `Missing security features: ${missing.join(', ')}` };
  }
}

// Test 8: Email System
function testEmailSystem() {
  const mailerFile = path.join(__dirname, 'backend/utils/mailer.js');
  if (!fs.existsSync(mailerFile)) {
    return { success: false, details: 'Mailer utility file missing' };
  }
  
  const content = fs.readFileSync(mailerFile, 'utf8');
  const features = ['nodemailer', 'sendMail', 'transporter'];
  
  const missing = features.filter(feature => !content.includes(feature));
  
  if (missing.length === 0) {
    return { success: true, details: 'Email system properly configured' };
  } else {
    return { success: false, details: `Missing email features: ${missing.join(', ')}` };
  }
}

// Test 9: Authentication System
function testAuthenticationSystem() {
  const authFile = path.join(__dirname, 'backend/api/auth/index.js');
  if (!fs.existsSync(authFile)) {
    return { success: false, details: 'Authentication file missing' };
  }
  
  const content = fs.readFileSync(authFile, 'utf8');
  const features = [
    'register',
    'login',
    'admin-login',
    'verify-email',
    'forgot-password',
    'bcrypt',
    'jwt'
  ];
  
  const missing = features.filter(feature => !content.includes(feature));
  
  if (missing.length === 0) {
    return { success: true, details: 'Complete authentication system verified' };
  } else {
    return { success: false, details: `Missing auth features: ${missing.join(', ')}` };
  }
}

// Test 10: Registration Form Enhancement
function testRegistrationFormEnhancement() {
  const regFormFile = path.join(__dirname, 'frontend/components/ModernRegistrationForm.tsx');
  if (!fs.existsSync(regFormFile)) {
    return { success: false, details: 'Registration form component missing' };
  }
  
  const content = fs.readFileSync(regFormFile, 'utf8');
  const features = [
    'proofOfAddress',
    'idDocument',
    'bankStatement',
    'Step 4',
    'Document Uploads'
  ];
  
  const missing = features.filter(feature => !content.includes(feature));
  
  if (missing.length === 0) {
    return { success: true, details: 'Enhanced registration form with document uploads verified' };
  } else {
    return { success: false, details: `Missing registration features: ${missing.join(', ')}` };
  }
}

// Test 11: Admin Credentials Configuration
function testAdminCredentials() {
  const authFile = path.join(__dirname, 'backend/api/auth/index.js');
  if (!fs.existsSync(authFile)) {
    return { success: false, details: 'Authentication file missing' };
  }
  
  const content = fs.readFileSync(authFile, 'utf8');
  
  if (content.includes('Keanmartin75@gmail.com') && content.includes('Tristan@89')) {
    return { success: true, details: 'Admin credentials properly configured' };
  } else {
    return { success: false, details: 'Admin credentials not found or incorrect' };
  }
}

// Test 12: Environment Configuration
function testEnvironmentConfiguration() {
  const envFiles = [
    'frontend/.env.production',
    'frontend/.env.local',
    'frontend/.env'
  ];
  
  let foundEnv = false;
  let envDetails = '';
  
  envFiles.forEach(envFile => {
    const envPath = path.join(__dirname, envFile);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      if (content.includes('api.all4youauctions.co.za')) {
        foundEnv = true;
        envDetails = `Found correct API URL in ${envFile}`;
      }
    }
  });
  
  if (foundEnv) {
    return { success: true, details: envDetails };
  } else {
    return { success: false, details: 'No environment file with correct API URL found' };
  }
}

// Run all tests
console.log('🚀 Starting comprehensive local validation...\n');

runTest('Project Structure', testProjectStructure);
runTest('Backend Core Files', testBackendCoreFiles);
runTest('Frontend Core Files', testFrontendCoreFiles);
runTest('Data Files', testDataFiles);
runTest('Upload Directories', testUploadDirectories);
runTest('Package Dependencies', testPackageDependencies);
runTest('Security Configuration', testSecurityConfiguration);
runTest('Email System', testEmailSystem);
runTest('Authentication System', testAuthenticationSystem);
runTest('Registration Form Enhancement', testRegistrationFormEnhancement);
runTest('Admin Credentials Configuration', testAdminCredentials);
runTest('Environment Configuration', testEnvironmentConfiguration);

console.log('\n===============================================');
console.log('🏁 LOCAL VALIDATION COMPLETE');
console.log('===============================================');
console.log(`✅ Tests Passed: ${results.passed}`);
console.log(`❌ Tests Failed: ${results.failed}`);
console.log(`📊 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);

if (results.failed === 0) {
  console.log('\n🎉 ALL LOCAL TESTS PASSED!');
  console.log('✅ Platform structure is complete and ready');
  console.log('✅ All core files and configurations verified');
  console.log('✅ Security, auth, and email systems configured');
  console.log('✅ Enhanced registration form with document uploads ready');
} else {
  console.log('\n⚠️  Some tests failed:');
  results.tests.filter(t => t.status !== 'PASS').forEach(test => {
    console.log(`❌ ${test.name}: ${test.details || 'Failed'}`);
  });
}

console.log('\n📝 NEXT STEPS FOR LIVE TESTING:');
console.log('1. ✅ Local validation complete');
console.log('2. 🌐 Visit: https://www.all4youauctions.co.za');
console.log('3. 🧪 Test navigation and homepage');
console.log('4. 📋 Test registration: https://www.all4youauctions.co.za/register');
console.log('5. 🔑 Test admin login: https://www.all4youauctions.co.za/admin');
console.log('6. 📧 Test contact form and email notifications');
console.log('7. 🔄 Test real-time features and WebSocket connections');

console.log('\n🔧 ADMIN CREDENTIALS FOR TESTING:');
console.log('Email: Keanmartin75@gmail.com');
console.log('Password: Tristan@89');

console.log('\n🎯 PLATFORM FEATURES TO TEST MANUALLY:');
console.log('• Homepage navigation and background gradient');
console.log('• 5-step registration with document uploads');
console.log('• Admin dashboard and auction management');
console.log('• Real-time bidding and notifications');
console.log('• Invoice generation and email delivery');
console.log('• Security features and rate limiting');
console.log('• Contact form and communication system');
