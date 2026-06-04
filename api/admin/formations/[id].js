const { createClient } = require('@supabase/supabase-js');
const { requireAdmin } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const admin = requireAdmin(req, res);
  if (!admin) return;

  const { id } = req.query;
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  if (req.method === 'PUT') {
    const body = req.body || {};
    const updates = {};
    if (body.titre       !== undefined) updates.titre       = body.titre.trim();
    if (body.duree       !== undefined) updates.duree       = body.duree.trim();
    if (body.niveau      !== undefined) updates.niveau      = body.niveau.trim();
    if (body.prix        !== undefined) updates.prix        = parseFloat(body.prix);
    if (body.description !== undefined) updates.description = body.description.trim();
    if (body.points      !== undefined) updates.points      = Array.isArray(body.points) ? body.points : [];
    if (body.places_max  !== undefined) updates.places_max  = parseInt(body.places_max) || 4;
    if (body.actif       !== undefined) updates.actif       = !!body.actif;

    const { data, error } = await supabase.from('formations').update(updates).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('formations').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
};
