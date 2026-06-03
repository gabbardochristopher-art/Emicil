const { createClient } = require('@supabase/supabase-js');
const { requireAdmin } = require('../_lib/auth');
const { str, price, int, safeError } = require('../_lib/validate');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('products').select('*').order('created_at', { ascending: false });
    if (error) return safeError(res, 500, 'Erreur base de données');
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const body = req.body || {};
    const name  = str(body.name, 200);
    const priceV = price(body.price);
    if (!name) return safeError(res, 400, 'Le nom est requis');
    if (priceV === null) return safeError(res, 400, 'Prix invalide');

    const oldPriceV = body.old_price != null ? price(body.old_price) : null;
    const stockV    = int(body.stock, 0, 99999) ?? 0;
    const ALLOWED_BADGES    = ['new', 'sale', null, ''];
    const ALLOWED_CATEGORIES = ['extensions', 'accessoires', 'soins', 'colle', ''];

    const badge    = ALLOWED_BADGES.includes(body.badge)    ? (body.badge || null) : null;
    const category = ALLOWED_CATEGORIES.includes(body.category) ? str(body.category) : '';

    const { data, error } = await supabase.from('products').insert([{
      name, category, price: priceV,
      old_price:   oldPriceV,
      stock:       stockV,
      badge,
      image:       str(body.image, 2000),
      sku:         str(body.sku, 100),
      description: str(body.description, 2000),
      featured:    !!body.featured,
      new_arrival: !!body.new_arrival,
    }]).select().single();

    if (error) return safeError(res, 500, 'Erreur lors de la création');
    return res.status(201).json(data);
  }

  return safeError(res, 405, 'Méthode non autorisée');
};
