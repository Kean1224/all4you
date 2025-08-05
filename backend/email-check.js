// Quick Email System Check
require('dotenv').config();

console.log('🔍 EMAIL SYSTEM CHECK...\n');

// Check environment variables
console.log('📋 ENVIRONMENT VARIABLES:');
console.log('SMTP_HOST:', process.env.SMTP_HOST || '❌ NOT SET');
console.log('SMTP_PORT:', process.env.SMTP_PORT || '❌ NOT SET');
console.log('SMTP_USER:', process.env.SMTP_USER || '❌ NOT SET');
console.log('SMTP_FROM:', process.env.SMTP_FROM || '❌ NOT SET');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ SET' : '❌ NOT SET');
console.log('');

// Test email configuration
async function testEmailSystem() {
  try {
    const { sendMail, testConnection } = require('./utils/mailer');
    
    console.log('🔗 Testing SMTP Connection...');
    const connectionOk = await testConnection();
    
    if (connectionOk) {
      console.log('✅ SMTP Connection: SUCCESS\n');
    } else {
      console.log('❌ SMTP Connection: FAILED');
    }
    
  } catch (error) {
    console.log('❌ Email system error:', error.message);
  }
}

// Check pending registrations
function checkPendingRegistrations() {
  console.log('\n📁 CHECKING PENDING REGISTRATIONS:');
  
  const fs = require('fs');
  const path = require('path');
  const pendingFile = path.join(__dirname, 'data/pending-registrations.json');
  
  if (fs.existsSync(pendingFile)) {
    console.log('✅ Pending registrations file exists');
    try {
      const pending = JSON.parse(fs.readFileSync(pendingFile, 'utf-8'));
      console.log(`📊 Current pending registrations: ${pending.length}`);
      
      if (pending.length > 0) {
        console.log('\nRecent pending registrations:');
        pending.slice(-5).forEach((user, index) => {
          const isExpired = new Date(user.expiresAt) < new Date();
          console.log(`${index + 1}. ${user.email}`);
          console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
          console.log(`   Expires: ${new Date(user.expiresAt).toLocaleString()}`);
          console.log(`   Status: ${isExpired ? '❌ EXPIRED' : '✅ VALID'}`);
          console.log(`   Token: ${user.verificationToken.substring(0, 20)}...`);
          console.log('');
        });
      } else {
        console.log('ℹ️  No pending registrations found (they may have expired)');
      }
    } catch (e) {
      console.log('❌ Error reading pending registrations:', e.message);
    }
  } else {
    console.log('❌ Pending registrations file not found');
  }
}

// Check recent server logs
function checkServerLogs() {
  console.log('\n📝 CHECKING FOR EMAIL SENDING LOGS:');
  console.log('💡 Check your server console for recent email sending attempts...');
}

// Run all checks
async function runChecks() {
  await testEmailSystem();
  checkPendingRegistrations();
  checkServerLogs();
  
  console.log('\n🔧 POSSIBLE ISSUES & SOLUTIONS:');
  console.log('1. ⏰ Registration tokens expire after 24 hours');
  console.log('2. 📧 Check your spam/junk folder');
  console.log('3. 🔑 Verify Gmail App Password is correct');
  console.log('4. 🌐 Ensure server is running when registering');
  console.log('5. 📱 Try registering with a different email address');
  console.log('\n🚨 If you just registered, try registering again as your token may have expired.');
}

runChecks().catch(console.error);
