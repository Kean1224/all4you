const nodemailer = require('nodemailer');

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Test SMTP connection
async function testConnection() {
  try {
    await transporter.verify();
    return true;
  } catch (err) {
    console.error('SMTP connection failed:', err.message);
    return false;
  }
}

// Send email
async function sendMail({ to, subject, text, html }) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendMail, testConnection };
