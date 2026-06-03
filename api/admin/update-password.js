const bcrypt   = require('bcryptjs');
const supabase  = require('../_lib/supabase');
const { requireAdmin } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Méthode non autorisée' });

  const admin = requireAdmin(req, res);
  if (!admin) return;

  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Champs requis manquants' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Le nouveau mot de passe doit faire au moins 6 caractères' });

  const { data: user } = await supabase
    .from('admin_users')
    .select('password_hash')
    .eq('id', admin.id)
    .single();

  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Mot de passe actuel incorrect' });

  const hash = await bcrypt.hash(newPassword, 12);
  const { error } = await supabase
    .from('admin_users')
    .update({ password_hash: hash })
    .eq('id', admin.id);

  if (error) return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  return res.status(200).json({ success: true });
};
