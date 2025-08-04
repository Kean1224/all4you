require('dotenv').config();

const express = require('express');
const cors = require('./cors-config'); // Use dedicated CORS config
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// 🛡️ Import security middleware
const {
  rateLimits,
  securityConfig,
  sanitizeInput,
  securityLogger,
  validateFileUpload,
  csrfProtection
} = require('./middleware/security');

const app = express();
const depositsRouter = require('./api/deposits/index');
const PORT = process.env.PORT || 5000;

// 🔒 Apply security middleware first
app.use(securityConfig); // Helmet security headers
app.use(securityLogger); // Security logging
app.use(sanitizeInput); // Input sanitization

// Apply CORS middleware (after security)
app.use(cors);
app.use(bodyParser.json());

// 🛡️ Apply rate limiting to different routes
app.use('/api/auth', rateLimits.auth);
app.use('/api/auth/register', rateLimits.registration);
app.use('/api/auth/forgot-password', rateLimits.passwordReset);
app.use('/api/contact', rateLimits.contact);
app.use('/api/lots/*/bid', rateLimits.bidding);
app.use('/api/admin', rateLimits.admin);
app.use('/api', rateLimits.api); // General API rate limit (applied last)

// Health check endpoint for frontend-backend communication
app.get('/api/ping', (req, res) => {
  console.log('Ping request from:', req.get('origin'));
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    version: '1.4-security-enhanced',
    security: 'Rate limiting and input sanitization active'
  });
});

// Health check for Render.com
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start WebSocket server for notifications
try {
  const { server: wsServer } = require('./ws-server');
  const wsPort = process.env.WS_PORT || 5051;
  wsServer.listen(wsPort, () => {
    console.log(`WebSocket server running on port ${wsPort}`);
  });
} catch (e) {
  console.error('WebSocket server failed to start:', e);
}

// Middleware - Static file serving with CORS headers
app.use('/uploads', (req, res, next) => {
  console.log(`Static file request: ${req.method} ${req.path}`);
  // Add CORS headers for static files
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Add a test endpoint to check if files exist
app.get('/test-upload/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', 'fica', req.params.filename);
  console.log(`Testing file: ${filePath}`);
  if (fs.existsSync(filePath)) {
    res.json({ exists: true, path: filePath, absolutePath: path.resolve(filePath) });
  } else {
    res.json({ exists: false, path: filePath, absolutePath: path.resolve(filePath) });
  }
});

// Add CORS test endpoint
const corsTestRouter = require('./cors-test-endpoint');
app.use('/api', corsTestRouter);

app.use('/api/deposits', depositsRouter);

// 🔌 Import API routes
const auctionsRouter = require('./api/auctions/index');
const authRouter = require('./api/auth/index'); // <-- ADDED
const ficaRouter = require('./api/fica');
const pendingItemsRouter = require('./api/pending-items');
const pendingUsersRouter = require('./api/pending-users');

// 🔗 Connect routes
app.use('/api/auctions', auctionsRouter);
app.use('/api/auth', authRouter); // <-- ADDED
app.use('/api/fica', ficaRouter);
app.use('/api/pending-items', pendingItemsRouter);
app.use('/api/pending-users', pendingUsersRouter);

// Add new registration routes
const registrationRouter = require('./api/auth/registration');
app.use('/api/auth', registrationRouter);

// Example route
app.get('/', (req, res) => {
  res.send('All4You Backend API is running...');
});


const contactRouter = require('./api/contact');
app.use('/api/contact', contactRouter);

const testEmailRouter = require('./api/test-email');
app.use('/api/test-email', testEmailRouter);

const invoiceRouter = require('./api/invoices/index');
app.use('/api/invoices', invoiceRouter);

const paymentsRouter = require('./api/payments/index');
app.use('/api/payments', paymentsRouter);

const lotsRouter = require('./api/lots/index');
app.use('/api/lots', lotsRouter);
const sellItemRouter = require('./api/sell-item/index');
app.use('/api/sell-item', sellItemRouter);
const usersRouter = require('./api/users/index');
app.use('/api/users', usersRouter);

// 📊 System status and health monitoring
const systemStatusRouter = require('./api/system/status');
app.use('/api/system', systemStatusRouter);

// Refunds API
const refundsRouter = require('./api/refunds/index');
app.use('/api/refunds', refundsRouter);

// Start the main Express server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`✅ Registration system with FICA uploads: ENABLED`);
  console.log(`✅ User management system: ENABLED`);
  console.log(`✅ Email verification system: ENABLED`);
});
