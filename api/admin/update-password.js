const bcrypt   = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const { requireAdmin } = require('../_lib/auth');
const { password, safeError } = require('../_lib/validate');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return safeError(res, 405, 'Méthode non autorisée');

  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    const currentPassword = password(req.body?.currentPassword);
    const newPassword     = password(req.body?.newPassword);
    if (!currentPassword || !newPassword) return safeError(res, 400, 'Mot de passe invalide (minimum 6 caractères)');

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data: user } = await supabase.from('admin_users').select('password_hash').eq('id', admin.id).single();
    if (!user) return safeError(res, 404, 'Utilisateur introuvable');

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return safeError(res, 401, 'Mot de passe actuel incorrect');

    const hash = await bcrypt.hash(newPassword, 12);
    const { error } = await supabase.from('admin_users').update({ password_hash: hash }).eq('id', admin.id);
    if (error) return safeError(res, 500, 'Erreur serveur');

    return res.status(200).json({ success: true });
  } catch {
    return safeError(res, 500, 'Erreur serveur');
  }
};
