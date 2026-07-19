const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Verifies the Authorization: Bearer <token> header.
 * On success, attaches { id, email } to req.user and calls next().
 * On failure, responds 401 and does not call next() — fails closed.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = verifyToken;
