const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'koperasi_jwt_secret_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'koperasi_jwt_secret_key_2026';
  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verifyToken
};
