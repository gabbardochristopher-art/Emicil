const { createClient } = require('@supabase/supabase-js');
const { requireAdmin } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' });

  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (error) return res.status(500).json({ error: error.message });

    const users = data?.users || [];
    const { data: profiles } = await supabase.from('profiles').select('id, points');
    const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

    return res.status(200).json(users.map(u => ({
      id:        u.id,
      email:     u.email,
      firstName: u.user_metadata?.firstName || '',
      lastName:  u.user_metadata?.lastName  || '',
      phone:     u.user_metadata?.phone     || '',
      points:    profileMap[u.id]?.points   || 0,
      confirmed: !!u.email_confirmed_at,
      createdAt: u.created_at,
    })));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
