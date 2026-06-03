const { createClient } = require('@supabase/supabase-js');

async function getUser(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { data: { user } } = await supabase.auth.getUser(auth.slice(7));
  return user || null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  // GET — commandes de l'utilisateur connecté
  if (req.method === 'GET') {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Non connecté' });
    const { data, error } = await supabase
      .from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // POST — créer une commande
  if (req.method === 'POST') {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Non connecté' });

    const { items, total, shipping_cost, shipping_mode } = req.body || {};
    if (!items || !total) return res.status(400).json({ error: 'Données manquantes' });

    const id = 'EMI-' + Date.now().toString(36).toUpperCase();
    const points_to_award = Math.round(total);

    const { data, error } = await supabase.from('orders').insert([{
      id, user_id: user.id, user_email: user.email,
      user_name: `${user.user_metadata?.firstName || ''} ${user.user_metadata?.lastName || ''}`.trim(),
      items, total, shipping_cost: shipping_cost || 0,
      shipping_mode: shipping_mode || 'collect',
      status: 'pending', points_to_award,
    }]).select().single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
};
