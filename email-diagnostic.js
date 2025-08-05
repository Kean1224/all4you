// Email System Diagnostic Tool
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('🔍 EMAIL SYSTEM DIAGNOSTIC STARTING...\n');

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
      
      // Test sending a verification email
      console.log('📧 Testing verification email send...');
      const testEmail = 'test@example.com';
      const verificationToken = 'test-token-123';
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      
      try {
        const result = await sendMail({
          to: testEmail,
          subject: 'TEST - Email Verification',
          text: `Test verification link: ${verificationUrl}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #d97706;">TEST - Welcome to All4You Auctions!</h2>
              <p>This is a test email to verify the email system is working.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Test Verification Link
                </a>
              </div>
              <p>Verification URL: ${verificationUrl}</p>
            </div>
          `
        });
        
        console.log('✅ Test email sent successfully!');
        console.log('📧 Message ID:', result.messageId);
        
      } catch (emailError) {
        console.log('❌ Test email failed:', emailError.message);
      }
      
    } else {
      console.log('❌ SMTP Connection: FAILED');
      console.log('⚠️  Emails will not be sent');
    }
    
  } catch (error) {
    console.log('❌ Email system error:', error.message);
  }
}

// Check verification endpoints
function checkVerificationFiles() {
  console.log('\n📁 VERIFICATION FILES CHECK:');
  
  const pendingFile = path.join(__dirname, 'backend/data/pending-registrations.json');
  const usersFile = path.join(__dirname, 'backend/data/users.json');
  
  console.log('Pending registrations file:', pendingFile);
  console.log('Users file:', usersFile);
  
  if (require('fs').existsSync(pendingFile)) {
    console.log('✅ Pending registrations file exists');
    try {
      const pending = JSON.parse(require('fs').readFileSync(pendingFile, 'utf-8'));
      console.log(`📊 Pending registrations: ${pending.length}`);
      
      if (pending.length > 0) {
        console.log('Recent pending registrations:');
        pending.slice(-3).forEach(user => {
          console.log(`  - ${user.email} (${user.createdAt})`);
          console.log(`    Token: ${user.verificationToken}`);
          console.log(`    Expires: ${new Date(user.expiresAt).toLocaleString()}`);
        });
      }
    } catch (e) {
      console.log('❌ Error reading pending registrations:', e.message);
    }
  } else {
    console.log('❌ Pending registrations file not found');
  }
  
  if (require('fs').existsSync(usersFile)) {
    console.log('✅ Users file exists');
  } else {
    console.log('❌ Users file not found');
  }
}

// Generate a manual verification link
function generateManualVerificationLink() {
  console.log('\n🔗 MANUAL VERIFICATION LINK GENERATOR:');
  console.log('If you have a pending registration, you can manually verify using:');
  console.log(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=YOUR_TOKEN_HERE`);
  console.log('');
  console.log('Replace YOUR_TOKEN_HERE with your actual verification token from the pending registrations.');
}

// Run diagnostics
async function runDiagnostics() {
  await testEmailSystem();
  checkVerificationFiles();
  generateManualVerificationLink();
  
  console.log('\n🏁 DIAGNOSTIC COMPLETE');
  console.log('');
  console.log('💡 TROUBLESHOOTING TIPS:');
  console.log('1. Check that SMTP credentials are correct in .env file');
  console.log('2. Ensure Gmail "App Passwords" is enabled if using Gmail');
  console.log('3. Check spam/junk folder for verification emails');
  console.log('4. Verify the NEXT_PUBLIC_BASE_URL is correct');
  console.log('5. Check server logs for email sending errors');
}

runDiagnostics().catch(console.error);
