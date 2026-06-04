const { createClient } = require('@supabase/supabase-js');
const { requireAdmin } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const admin = requireAdmin(req, res);
  if (!admin) return;

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('formations').select('*').order('id');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    if (!body.titre?.trim()) return res.status(400).json({ error: 'Le titre est requis' });
    if (body.prix === undefined || isNaN(parseFloat(body.prix))) return res.status(400).json({ error: 'Prix invalide' });

    const { data, error } = await supabase.from('formations').insert([{
      titre:       body.titre.trim(),
      duree:       body.duree?.trim() || '',
      niveau:      body.niveau?.trim() || 'Tous niveaux',
      prix:        parseFloat(body.prix),
      description: body.description?.trim() || '',
      points:      Array.isArray(body.points) ? body.points : [],
      places_max:  parseInt(body.places_max) || 4,
      actif:       body.actif !== false,
    }]).select().single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
};
