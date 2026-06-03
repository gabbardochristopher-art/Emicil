const jwt = require('jsonwebtoken');

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function getToken(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

function requireAdmin(req, res) {
  const token = getToken(req);
  if (!token) { res.status(401).json({ error: 'Token manquant' }); return null; }
  try { return verifyToken(token); }
  catch { res.status(401).json({ error: 'Session expirée, reconnectez-vous' }); return null; }
}

module.exports = { signToken, verifyToken, getToken, requireAdmin };
