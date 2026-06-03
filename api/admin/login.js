const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { str, email, password, safeError } = require('../_lib/validate');
const { checkRateLimit, recordAttempt }   = require('../_lib/ratelimit');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return safeError(res, 405, 'Méthode non autorisée');

  try {
    const rawEmail    = email(req.body?.email);
    const rawPassword = password(req.body?.password);

    if (!rawEmail || !rawPassword) return safeError(res, 400, 'Identifiants invalides');

    // Rate limiting par email
    const blocked = await checkRateLimit(`admin_login:${rawEmail}`);
    if (blocked) return safeError(res, 429, 'Trop de tentatives. Réessayez dans 15 minutes.');

    await recordAttempt(`admin_login:${rawEmail}`);

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY || !process.env.JWT_SECRET) {
      return safeError(res, 500, 'Configuration serveur manquante');
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('id, email, password_hash')
      .eq('email', rawEmail)
      .single();

    // Délai constant pour éviter les timing attacks
    const dummyHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCkQVB6T/V6Xa1F.ZzJVAFi';
    const hashToCompare = (error || !admin) ? dummyHash : admin.password_hash;
    const valid = await bcrypt.compare(rawPassword, hashToCompare);

    if (error || !admin || !valid) return safeError(res, 401, 'Identifiants incorrects');

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({ token, email: admin.email });

  } catch (err) {
    // Ne jamais exposer le détail de l'erreur interne
    return safeError(res, 500, 'Erreur serveur');
  }
};
