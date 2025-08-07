const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Real admin JWT verification middleware
module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, SECRET, (err, user) => {
    if (err || !user || user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin token' });
    }
    req.user = user;
    if (typeof next === 'function') return next();
    // For direct calls (no next), mimic success
    return res.json({ ok: true });
  });
};
