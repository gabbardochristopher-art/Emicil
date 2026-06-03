const supabase = require('../_lib/supabase');
const { requireAdmin } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — public
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: 'Erreur base de données' });
    return res.status(200).json(data);
  }

  // POST — admin uniquement
  if (req.method === 'POST') {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const { name, category, price, old_price, image, badge, featured, new_arrival, stock, description, sku } = req.body || {};
    if (!name || price === undefined) return res.status(400).json({ error: 'Nom et prix requis' });

    const { data, error } = await supabase
      .from('products')
      .insert([{ name, category, price, old_price, image: image || '', badge: badge || null, featured: !!featured, new_arrival: !!new_arrival, stock: stock || 0, description: description || '', sku: sku || '' }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Erreur lors de la création' });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
};
