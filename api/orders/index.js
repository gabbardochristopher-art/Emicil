const { createClient } = require('@supabase/supabase-js');
const { safeError } = require('../_lib/validate');

async function getUser(req) {
  const auth = (req.headers.authorization || '');
  if (!auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  if (!token || token.length > 2048) return null;
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data } = await supabase.auth.getUser(token);
    return data?.user || null;
  } catch { return null; }
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  if (req.method === 'GET') {
    const user = await getUser(req);
    if (!user) return safeError(res, 401, 'Non connecté');
    const { data, error } = await supabase
      .from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) return safeError(res, 500, 'Erreur serveur');
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const user = await getUser(req);
    if (!user) return safeError(res, 401, 'Non connecté');

    const body = req.body || {};
    const items = body.items;

    // Validation des articles
    if (!Array.isArray(items) || items.length === 0) return safeError(res, 400, 'Panier vide ou invalide');
    if (items.length > 50) return safeError(res, 400, 'Trop d\'articles');

    // Recalcul du total depuis la base pour éviter toute manipulation côté client
    const productIds = [...new Set(items.map(i => parseInt(i.id, 10)).filter(Boolean))];
    const { data: products } = await supabase.from('products').select('id, price, stock').in('id', productIds);
    if (!products) return safeError(res, 500, 'Erreur serveur');

    const productMap = Object.fromEntries(products.map(p => [String(p.id), p]));
    let recalcTotal = 0;

    for (const item of items) {
      const prod = productMap[String(item.id)];
      if (!prod) return safeError(res, 400, `Produit introuvable : ${item.id}`);
      if (prod.stock === 0) return safeError(res, 400, `Produit épuisé : ${item.id}`);
      const qty = parseInt(item.qty, 10);
      if (!qty || qty < 1 || qty > 99) return safeError(res, 400, 'Quantité invalide');
      recalcTotal += parseFloat(prod.price) * qty;
    }

    const ALLOWED_MODES   = ['collect', 'relais', 'domicile'];
    const shippingMode    = ALLOWED_MODES.includes(body.shipping_mode) ? body.shipping_mode : 'collect';
    const shippingCost    = parseFloat(body.shipping_cost) || 0;
    if (shippingCost < 0 || shippingCost > 50) return safeError(res, 400, 'Frais de livraison invalides');

    const total          = Math.round((recalcTotal + shippingCost) * 100) / 100;
    const points_to_award = Math.round(recalcTotal);
    const id             = 'EMI-' + Date.now().toString(36).toUpperCase();

    const { data, error } = await supabase.from('orders').insert([{
      id,
      user_id:       user.id,
      user_email:    user.email,
      user_name:     `${user.user_metadata?.firstName || ''} ${user.user_metadata?.lastName || ''}`.trim(),
      items,
      total,
      shipping_cost: shippingCost,
      shipping_mode: shippingMode,
      status:        'pending',
      points_to_award,
    }]).select().single();

    if (error) return safeError(res, 500, 'Erreur lors de la création de la commande');

    // Décrémente le stock de chaque produit commandé
    await Promise.all(items.map(async (item) => {
      const prod = productMap[String(item.id)];
      if (!prod) return;
      const qty       = parseInt(item.qty, 10) || 1;
      const newStock  = Math.max(0, prod.stock - qty);
      await supabase.from('products').update({ stock: newStock }).eq('id', parseInt(item.id, 10));
    }));

    return res.status(201).json(data);
  }

  return safeError(res, 405, 'Méthode non autorisée');
};
