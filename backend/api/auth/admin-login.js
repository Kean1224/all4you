const jwt = require('jsonwebtoken');

// Use a strong secret in production!
const SECRET = process.env.JWT_SECRET || 'dev_secret_key';


// Allow multiple admin credentials
const ADMIN_CREDENTIALS = [
  { email: 'Keanmartin75@gmail.com', password: 'Tristan@89' },
  { email: 'admin@admin.com', password: 'admin123' }
];

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email, password } = req.body;
  const isValid = ADMIN_CREDENTIALS.some(
    (admin) => admin.email === email && admin.password === password
  );
  if (isValid) {
    // Issue JWT
    const token = jwt.sign({ email, role: 'admin' }, SECRET, { expiresIn: '2h' });
    return res.json({ token });
  } else {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
};
