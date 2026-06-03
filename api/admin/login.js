const bcrypt   = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const jwt      = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ error: 'Variables SUPABASE_URL / SUPABASE_SERVICE_KEY manquantes' });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Variable JWT_SECRET manquante' });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('id, email, password_hash')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !admin) return res.status(401).json({ error: 'Identifiants incorrects' });

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ error: 'Identifiants incorrects' });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({ token, email: admin.email });

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erreur serveur interne' });
  }
};
