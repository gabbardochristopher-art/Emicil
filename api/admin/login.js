const bcrypt  = require('bcryptjs');
const supabase = require('../_lib/supabase');
const { signToken } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

  const { data: admin, error } = await supabase
    .from('admin_users')
    .select('id, email, password_hash')
    .eq('email', email.toLowerCase().trim())
    .single();

  // Même message d'erreur dans les deux cas pour ne pas révéler si l'email existe
  if (error || !admin) return res.status(401).json({ error: 'Identifiants incorrects' });

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) return res.status(401).json({ error: 'Identifiants incorrects' });

  const token = signToken({ id: admin.id, email: admin.email, role: 'admin' });
  return res.status(200).json({ token, email: admin.email });
};
