const { createClient } = require('@supabase/supabase-js');
const { requireAdmin } = require('../_lib/auth');
const { str, price, int, productOptions, safeError } = require('../_lib/validate');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  const idNum = parseInt(id, 10);
  if (!id || isNaN(idNum)) return safeError(res, 400, 'ID invalide');

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('products').select('*').eq('id', idNum).single();
    if (error || !data) return safeError(res, 404, 'Produit introuvable');
    return res.status(200).json(data);
  }

  const admin = requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'PUT') {
    const body = req.body || {};
    const name   = str(body.name, 200);
    const priceV = price(body.price);
    if (!name) return safeError(res, 400, 'Le nom est requis');
    if (priceV === null) return safeError(res, 400, 'Prix invalide');

    const oldPriceV = body.old_price != null ? price(body.old_price) : null;
    const stockV    = int(body.stock, 0, 99999) ?? 0;
    const ALLOWED_BADGES     = ['new', 'sale', null, ''];
    const ALLOWED_CATEGORIES = ['extensions', 'accessoires', 'soins', 'colle', ''];

    const badge    = ALLOWED_BADGES.includes(body.badge)     ? (body.badge || null) : null;
    const category = ALLOWED_CATEGORIES.includes(body.category) ? str(body.category) : '';

    const { data, error } = await supabase.from('products').update({
      name, category, price: priceV,
      old_price:   oldPriceV,
      stock:       stockV,
      badge,
      image:       str(body.image, 2000),
      sku:         str(body.sku, 100),
      description: str(body.description, 2000),
      featured:    !!body.featured,
      new_arrival: !!body.new_arrival,
      options:     productOptions(body.options),
    }).eq('id', idNum).select().single();

    if (error) return safeError(res, 500, 'Erreur lors de la mise à jour');
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('products').delete().eq('id', idNum);
    if (error) return safeError(res, 500, 'Erreur lors de la suppression');
    return res.status(200).json({ success: true });
  }

  return safeError(res, 405, 'Méthode non autorisée');
};
