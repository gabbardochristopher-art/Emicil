const { createClient } = require('@supabase/supabase-js');
const { requireAdmin } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Méthode non autorisée' });

  const admin = requireAdmin(req, res);
  if (!admin) return;

  const { id } = req.query;
  const { status } = req.body || {};

  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { data, error } = await supabase
    .from('formation_bookings').update({ status }).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
};
