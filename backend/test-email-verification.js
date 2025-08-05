// Test Email Verification System
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

console.log('🔍 EMAIL VERIFICATION DIAGNOSTIC');
console.log('================================\n');

// Check environment
console.log('📋 ENVIRONMENT VARIABLES:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
console.log('');

// Check pending registrations
function checkPendingRegistrations() {
  console.log('📁 CHECKING PENDING REGISTRATIONS:');
  const pendingFile = path.join(__dirname, 'data/pending-registrations.json');
  
  if (fs.existsSync(pendingFile)) {
    try {
      const pending = JSON.parse(fs.readFileSync(pendingFile, 'utf-8'));
      console.log(`Found ${pending.length} pending registration(s)`);
      
      pending.forEach((user, index) => {
        console.log(`\n${index + 1}. Email: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Token: ${user.verificationToken}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Expires: ${new Date(user.expiresAt).toLocaleString()}`);
        console.log(`   Status: ${Date.now() > user.expiresAt ? '❌ EXPIRED' : '✅ VALID'}`);
        
        if (Date.now() <= user.expiresAt) {
          const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${user.verificationToken}`;
          console.log(`   📧 Manual Verification Link: ${verificationUrl}`);
        }
      });
    } catch (error) {
      console.log('❌ Error reading pending registrations:', error.message);
    }
  } else {
    console.log('📝 No pending registrations file found');
  }
}

// Test email sending
async function testEmailSending() {
  console.log('\n📧 TESTING EMAIL SYSTEM:');
  try {
    const { sendMail, testConnection } = require('./utils/mailer');
    
    console.log('Testing SMTP connection...');
    const connectionOk = await testConnection();
    
    if (connectionOk) {
      console.log('✅ SMTP connection successful!');
      
      // Send a test email
      console.log('\nSending test verification email...');
      const testToken = 'test-' + Date.now();
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${testToken}`;
      
      const result = await sendMail({
        to: 'admin@all4youauctions.co.za', // Send to yourself for testing
        subject: 'TEST - Email Verification System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d97706;">TEST - Email Verification</h2>
            <p>This is a test email to verify the email system is working properly.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Test Verification Link
              </a>
            </div>
            <p><strong>Test URL:</strong> ${verificationUrl}</p>
            <p>If you receive this email, the system is working correctly!</p>
          </div>
        `
      });
      
      console.log('✅ Test email sent successfully!');
      console.log('Message ID:', result.messageId);
      
    } else {
      console.log('❌ SMTP connection failed');
    }
    
  } catch (error) {
    console.log('❌ Email test failed:', error.message);
  }
}

// Main diagnostic function
async function runDiagnostic() {
  checkPendingRegistrations();
  await testEmailSending();
  
  console.log('\n💡 TROUBLESHOOTING TIPS:');
  console.log('1. Check your spam/junk folder for verification emails');
  console.log('2. Use the manual verification links above if emails failed');
  console.log('3. Make sure you\'re using the correct email address');
  console.log('4. Try registering again if your token has expired');
  console.log('\n🔗 Manual verification format:');
  console.log(`   ${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=YOUR_TOKEN_HERE`);
}

runDiagnostic().catch(console.error);
