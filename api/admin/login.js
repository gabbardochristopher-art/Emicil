const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { email, password, safeError } = require('../_lib/validate');
const { checkRateLimit, recordAttempt } = require('../_lib/ratelimit');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return safeError(res, 405, 'Méthode non autorisée');

  try {
    const rawEmail    = email(req.body?.email);
    const rawPassword = password(req.body?.password);
    if (!rawEmail || !rawPassword) return safeError(res, 400, 'Identifiants invalides');

    const blocked = await checkRateLimit(`admin_login:${rawEmail}`);
    if (blocked) return safeError(res, 429, 'Trop de tentatives. Réessayez dans 15 minutes.');
    await recordAttempt(`admin_login:${rawEmail}`);

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY || !process.env.JWT_SECRET)
      return safeError(res, 500, 'Configuration serveur manquante');

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data: adminUser, error } = await supabase
      .from('admin_users').select('id, email, password_hash').eq('email', rawEmail).single();

    const dummyHash   = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCkQVB6T/V6Xa1F.ZzJVAFi';
    const hashToCheck = (error || !adminUser) ? dummyHash : adminUser.password_hash;
    const valid       = await bcrypt.compare(rawPassword, hashToCheck);
    if (error || !adminUser || !valid) return safeError(res, 401, 'Identifiants incorrects');

    const token = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.status(200).json({ token, email: adminUser.email });
  } catch { return safeError(res, 500, 'Erreur serveur'); }
};
