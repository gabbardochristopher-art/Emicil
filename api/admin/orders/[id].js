const { createClient } = require('@supabase/supabase-js');
const { requireAdmin } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Méthode non autorisée' });

  const admin = requireAdmin(req, res);
  if (!admin) return;

  const { id } = req.query;
  const { status } = req.body || {};
  if (!['validated', 'refused'].includes(status)) return res.status(400).json({ error: 'Statut invalide' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  // Récupère la commande
  const { data: order, error: fetchErr } = await supabase
    .from('orders').select('*').eq('id', id).single();
  if (fetchErr || !order) return res.status(404).json({ error: 'Commande introuvable' });
  if (order.status !== 'pending') return res.status(400).json({ error: 'Commande déjà traitée' });

  // Met à jour le statut
  const { error: updateErr } = await supabase
    .from('orders').update({ status }).eq('id', id);
  if (updateErr) return res.status(500).json({ error: updateErr.message });

  // Si validée → ajoute les points au profil client
  if (status === 'validated' && order.user_id && order.points_to_award > 0) {
    const { data: profile } = await supabase
      .from('profiles').select('points').eq('id', order.user_id).single();
    const currentPts = profile?.points || 0;
    await supabase
      .from('profiles').update({ points: currentPts + order.points_to_award }).eq('id', order.user_id);
  }

  return res.status(200).json({ success: true, status });
};
