const { createClient } = require('@supabase/supabase-js');
const { requireAdmin } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const admin = requireAdmin(req, res);
  if (!admin) return;

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  try {
    // Récupère tous les utilisateurs via l'API Admin Supabase
    const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (error) return res.status(500).json({ error: error.message });

    // Récupère les profils (points)
    const { data: profiles } = await supabase.from('profiles').select('id, points');
    const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

    const result = users.map(u => ({
      id:         u.id,
      email:      u.email,
      firstName:  u.user_metadata?.firstName || '',
      lastName:   u.user_metadata?.lastName  || '',
      phone:      u.user_metadata?.phone     || '',
      points:     profileMap[u.id]?.points   || 0,
      confirmed:  !!u.email_confirmed_at,
      createdAt:  u.created_at,
    }));

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
