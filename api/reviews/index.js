const { createClient } = require('@supabase/supabase-js');
const { str, int, safeError } = require('../_lib/validate');

async function getUser(req, supabase) {
  const auth = (req.headers.authorization || '');
  if (!auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  if (!token || token.length > 2048) return null;
  try {
    const { data } = await supabase.auth.getUser(token);
    return data?.user || null;
  } catch { return null; }
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  if (req.method === 'GET') {
    if (req.query.summary) {
      const { data, error } = await supabase
        .from('reviews')
        .select('product_id, rating')
        .eq('status', 'approved');
      if (error) return safeError(res, 500, 'Erreur serveur');
      const sums = {};
      (data || []).forEach(r => {
        const s = sums[r.product_id] || (sums[r.product_id] = { total: 0, count: 0 });
        s.total += r.rating; s.count += 1;
      });
      const stats = {};
      Object.entries(sums).forEach(([id, s]) => { stats[id] = { note: +(s.total / s.count).toFixed(1), avis: s.count }; });
      return res.status(200).json(stats);
    }

    const productId = int(req.query.product_id, 1, 9999999);
    if (!productId) return safeError(res, 400, 'product_id requis');
    const { data, error } = await supabase
      .from('reviews')
      .select('id, user_name, rating, comment, created_at')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (error) return safeError(res, 500, 'Erreur serveur');
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const user = await getUser(req, supabase);
    if (!user) return safeError(res, 401, 'Connectez-vous pour laisser un avis');

    const body = req.body || {};
    const productId = int(body.product_id, 1, 9999999);
    const rating    = int(body.rating, 1, 5);
    const comment   = str(body.comment, 1000);
    if (!productId) return safeError(res, 400, 'Produit invalide');
    if (!rating)    return safeError(res, 400, 'Note invalide (1 à 5)');
    if (!comment)   return safeError(res, 400, 'Le commentaire est requis');

    const { data: product } = await supabase.from('products').select('id').eq('id', productId).single();
    if (!product) return safeError(res, 404, 'Produit introuvable');

    const { data: existing } = await supabase
      .from('reviews').select('id').eq('product_id', productId).eq('user_id', user.id).maybeSingle();
    if (existing) return safeError(res, 409, 'Vous avez déjà laissé un avis sur ce produit');

    const meta = user.user_metadata || {};
    const userName = str(`${meta.firstName || ''} ${meta.lastName || ''}`, 120) || str(user.email, 120).split('@')[0];

    const { data, error } = await supabase.from('reviews').insert([{
      product_id: productId,
      user_id:    user.id,
      user_name:  userName,
      rating,
      comment,
      status:     'pending',
    }]).select('id, rating, comment, status, created_at').single();

    if (error) return safeError(res, 500, 'Erreur lors de l\'envoi de l\'avis');
    return res.status(201).json(data);
  }

  return safeError(res, 405, 'Méthode non autorisée');
};
