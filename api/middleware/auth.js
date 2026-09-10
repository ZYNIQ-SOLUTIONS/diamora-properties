const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../utils/jwtConfig');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Assuming format "Bearer <token>"
    const secret = getJwtSecret();
    const decoded = jwt.verify(token.replace('Bearer ', ''), secret);
    req.user = decoded.user;
    next();
  } catch (err) {
    if (err.message && err.message.includes('FATAL SECURITY ERROR')) {
      console.error(err.message);
      return res.status(500).json({ message: 'Authentication service configuration error' });
    }
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
