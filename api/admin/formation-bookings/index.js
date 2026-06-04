const { createClient } = require('@supabase/supabase-js');
const { requireAdmin } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const admin = requireAdmin(req, res);
  if (!admin) return;

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('formation_bookings')
      .select('*, formations(titre)')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
};
