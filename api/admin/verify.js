const { requireAdmin } = require('../_lib/auth');

module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const admin = requireAdmin(req, res);
  if (!admin) return;

  return res.status(200).json({ valid: true, email: admin.email });
};
