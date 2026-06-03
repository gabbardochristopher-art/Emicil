const supabase = require('../_lib/supabase');
const { requireAdmin } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID manquant' });

  // GET — public
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error || !data) return res.status(404).json({ error: 'Produit introuvable' });
    return res.status(200).json(data);
  }

  // PUT / DELETE — admin uniquement
  const admin = requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'PUT') {
    const { name, category, price, old_price, image, badge, featured, new_arrival, stock, description, sku } = req.body || {};
    const { data, error } = await supabase
      .from('products')
      .update({ name, category, price, old_price, image, badge, featured, new_arrival, stock, description, sku })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return res.status(500).json({ error: 'Erreur lors de la suppression' });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
};
