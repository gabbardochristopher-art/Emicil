// ==========================================================================
//  EMICILS — API consolidée (route dynamique unique : /api/[...route])
//  Toutes les routes publiques + admin passent par cette seule fonction
//  serverless (limite Vercel Hobby : 12 fonctions max par déploiement).
//  ex.  /api/products            → route = ['products']
//       /api/products/12         → route = ['products', '12']
//       /api/admin/orders/12     → route = ['admin', 'orders', '12']
// ==========================================================================

const bcrypt           = require('bcryptjs');
const jwt              = require('jsonwebtoken');
const Stripe           = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { requireAdmin } = require('./_lib/auth');
const { str, email, price, int, password, productOptions, safeError } = require('./_lib/validate');
const { checkRateLimit, recordAttempt } = require('./_lib/ratelimit');
const { sendEmail, orderConfirmation, bookingConfirmation, welcomeEmail } = require('./_lib/email');

function db() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

const CATEGORIES = [
  { id: "extensions",  label: "Extensions de cil" },
  { id: "accessoires", label: "Accessoires" },
  { id: "soins",       label: "Soins & entretien" },
  { id: "colle",       label: "Colle" },
];

const ALLOWED_BADGES     = ['new', 'sale', null, ''];
const ALLOWED_CATEGORIES = ['extensions', 'accessoires', 'soins', 'colle', ''];

async function getBearerUser(req, supabase) {
  const auth = (req.headers.authorization || '');
  if (!auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  if (!token || token.length > 2048) return null;
  try {
    const { data } = await supabase.auth.getUser(token);
    return data?.user || null;
  } catch { return null; }
}

// ---- Catégories ----
function handleCategories(req, res) {
  return res.status(200).json(CATEGORIES);
}

// ---- Paiement Stripe ----
async function handlePaymentIntent(req, res) {
  if (req.method !== 'POST') return safeError(res, 405, 'Méthode non autorisée');
  if (!process.env.STRIPE_SECRET_KEY) return safeError(res, 500, 'Stripe non configuré');

  const { amount } = req.body || {};
  if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 10000) {
    return safeError(res, 400, 'Montant invalide');
  }
  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
    });
    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (e) {
    return safeError(res, 500, 'Erreur Stripe : ' + e.message);
  }
}

// ---- Formations (catalogue public) ----
async function handleFormations(req, res, supabase) {
  if (req.method !== 'GET') return safeError(res, 405, 'Méthode non autorisée');
  const [formRes, bookRes] = await Promise.all([
    supabase.from('formations').select('*').eq('actif', true).order('id'),
    supabase.from('formation_bookings').select('formation_id, date_choisie, status'),
  ]);
  if (formRes.error) return safeError(res, 500, formRes.error.message);

  const bookings = bookRes.data || [];
  const formations = (formRes.data || []).map(f => {
    const placesMax = f.places_max || 4;
    const fBookings = bookings.filter(b => b.formation_id === f.id && b.status !== 'cancelled');
    const datePlaces = {};
    (f.dates || []).forEach(d => {
      const taken = fBookings.filter(b => b.date_choisie === d).length;
      datePlaces[d] = Math.max(0, placesMax - taken);
    });
    return { ...f, date_places: datePlaces };
  });
  return res.status(200).json(formations);
}

// ---- Réservations de formation ----
async function handleFormationBookings(req, res, supabase) {
  if (req.method !== 'POST') return safeError(res, 405, 'Méthode non autorisée');

  const { formation_id, user_email, user_name, user_phone, message, date_choisie } = req.body || {};
  if (!formation_id || !user_email?.trim()) return safeError(res, 400, 'Formation et email requis');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user_email.trim())) return safeError(res, 400, 'Email invalide');

  const fId = parseInt(formation_id);
  const dateVal = date_choisie?.trim() || '';

  if (dateVal) {
    const [formRes, countRes] = await Promise.all([
      supabase.from('formations').select('places_max').eq('id', fId).single(),
      supabase.from('formation_bookings').select('id').eq('formation_id', fId).eq('date_choisie', dateVal).neq('status', 'cancelled'),
    ]);
    const placesMax = formRes.data?.places_max || 4;
    const taken     = (countRes.data || []).length;
    if (taken >= placesMax) return safeError(res, 400, 'Plus de places disponibles pour cette date.');
  }

  const row = {
    formation_id: fId,
    user_email:   user_email.trim(),
    user_name:    user_name?.trim() || '',
    user_phone:   user_phone?.trim() || '',
    message:      message?.trim() || '',
  };
  if (dateVal) row.date_choisie = dateVal;

  const { data, error } = await supabase.from('formation_bookings').insert([row]).select().single();

  if (error) return safeError(res, 500, error.message);

  const { data: formation } = await supabase
    .from('formations').select('titre, niveau, prix').eq('id', parseInt(formation_id)).single();

  await sendEmail({
    to: user_email.trim(),
    subject: `Votre demande d'inscription — ${formation?.titre || 'Formation Emicils'}`,
    html: bookingConfirmation({
      formationTitre: formation?.titre || '',
      niveau:         formation?.niveau || '',
      prix:           formation?.prix || '',
      prenom:         user_name?.trim().split(' ')[0] || '',
      email:          user_email.trim(),
    }),
  });

  return res.status(201).json(data);
}

// ---- Profil client (points fidélité) ----
async function handleProfile(req, res, supabase) {
  const auth = (req.headers.authorization || '');
  if (!auth.startsWith('Bearer ')) return safeError(res, 401, 'Non connecté');

  let user;
  try {
    const { data } = await supabase.auth.getUser(auth.slice(7));
    user = data?.user;
  } catch { return safeError(res, 401, 'Session invalide'); }
  if (!user) return safeError(res, 401, 'Session invalide');

  let { data: profile } = await supabase.from('profiles').select('points').eq('id', user.id).single();

  if (!profile) {
    const { data: created } = await supabase
      .from('profiles').upsert({ id: user.id, points: 0 }, { onConflict: 'id' }).select('points').single();
    profile = created;
    await sendEmail({
      to: user.email,
      subject: 'Bienvenue chez Emicils !',
      html: welcomeEmail({ prenom: user.user_metadata?.firstName || '' }),
    });
  }

  return res.status(200).json({ points: profile?.points ?? 0 });
}

// ---- Commandes ----
async function handleOrders(req, res, supabase) {
  const user = await getBearerUser(req, supabase);

  if (req.method === 'GET') {
    if (!user) return safeError(res, 401, 'Non connecté');
    const { data, error } = await supabase
      .from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) return safeError(res, 500, 'Erreur serveur');
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    if (!user) return safeError(res, 401, 'Non connecté');

    const body  = req.body || {};
    const items = body.items;
    if (!Array.isArray(items) || items.length === 0) return safeError(res, 400, 'Panier vide ou invalide');
    if (items.length > 50) return safeError(res, 400, 'Trop d\'articles');

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

    const ALLOWED_MODES = ['collect', 'relais', 'domicile'];
    const shippingMode  = ALLOWED_MODES.includes(body.shipping_mode) ? body.shipping_mode : 'collect';
    const shippingCost  = parseFloat(body.shipping_cost) || 0;
    if (shippingCost < 0 || shippingCost > 50) return safeError(res, 400, 'Frais de livraison invalides');

    let shippingAddress = null;
    if (shippingMode === 'domicile') {
      const addr       = body.shipping_address || {};
      const adresse    = str(addr.adresse, 200);
      const codePostal = str(addr.codePostal, 10);
      const ville      = str(addr.ville, 100);
      if (!adresse || !codePostal || !ville) return safeError(res, 400, 'Adresse de livraison incomplète');
      shippingAddress = { adresse, codePostal, ville };
    }

    const total           = Math.round((recalcTotal + shippingCost) * 100) / 100;
    const points_to_award = Math.round(recalcTotal);
    const id              = 'EMI-' + Date.now().toString(36).toUpperCase();

    const ALLOWED_PAYMENT = ['card', 'store'];
    const paymentMethod   = ALLOWED_PAYMENT.includes(body.payment_method) ? body.payment_method : 'card';

    const { data, error } = await supabase.from('orders').insert([{
      id,
      user_id:        user.id,
      user_email:     user.email,
      user_name:      `${user.user_metadata?.firstName || ''} ${user.user_metadata?.lastName || ''}`.trim(),
      items,
      total,
      shipping_cost:  shippingCost,
      shipping_mode:  shippingMode,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      status:         'pending',
      points_to_award,
    }]).select().single();

    if (error) return safeError(res, 500, 'Erreur lors de la création de la commande');

    await Promise.all([
      ...items.map(async (item) => {
        const prod = productMap[String(item.id)];
        if (!prod) return;
        const qty      = parseInt(item.qty, 10) || 1;
        const newStock = Math.max(0, prod.stock - qty);
        await supabase.from('products').update({ stock: newStock }).eq('id', parseInt(item.id, 10));
      }),
      sendEmail({
        to: user.email,
        subject: `Votre commande Emicils — ${id}`,
        html: orderConfirmation({
          ref: id, items, total, shipping: shippingCost, mode: shippingMode,
          ptsGagnes: points_to_award, prenom: user.user_metadata?.firstName || '',
        }),
      }),
    ]);

    return res.status(201).json(data);
  }

  return safeError(res, 405, 'Méthode non autorisée');
}

// ---- Avis clients ----
async function handleReviews(req, res, supabase) {
  if (req.method === 'GET') {
    if (req.query.summary) {
      const { data, error } = await supabase.from('reviews').select('product_id, rating').eq('status', 'approved');
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
      .from('reviews').select('id, user_name, rating, comment, created_at')
      .eq('product_id', productId).eq('status', 'approved').order('created_at', { ascending: false });
    if (error) return safeError(res, 500, 'Erreur serveur');
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const user = await getBearerUser(req, supabase);
    if (!user) return safeError(res, 401, 'Connectez-vous pour laisser un avis');

    const body      = req.body || {};
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

    const meta     = user.user_metadata || {};
    const userName = str(`${meta.firstName || ''} ${meta.lastName || ''}`, 120) || str(user.email, 120).split('@')[0];

    const { data, error } = await supabase.from('reviews').insert([{
      product_id: productId, user_id: user.id, user_name: userName, rating, comment, status: 'pending',
    }]).select('id, rating, comment, status, created_at').single();

    if (error) return safeError(res, 500, 'Erreur lors de l\'envoi de l\'avis');
    return res.status(201).json(data);
  }

  return safeError(res, 405, 'Méthode non autorisée');
}

// ---- Soumissions popup quiz ----
async function handlePopupSubmissions(req, res, supabase) {
  if (req.method !== 'POST') return safeError(res, 405, 'Méthode non autorisée');

  const body     = req.body || {};
  const prenom   = str(body.prenom, 100);
  const nom      = str(body.nom, 100);
  const telephone = str(body.telephone, 30);
  const emailVal = email(body.email);
  const style    = str(body.style, 100);
  const experience = str(body.experience, 100);
  const objectif = str(body.objectif, 100);

  if (!prenom || !nom) return safeError(res, 400, 'Nom et prénom requis');
  if (!emailVal) return safeError(res, 400, 'Email invalide');

  const { data, error: dbErr } = await supabase.from('popup_submissions').insert([{
    prenom, nom, telephone, email: emailVal, style, experience, objectif,
  }]).select().single();

  if (dbErr) return safeError(res, 500, dbErr.message);
  return res.status(201).json(data);
}

// ---- Réservations du client connecté ----
async function handleMyBookings(req, res, supabase) {
  if (req.method !== 'GET') return safeError(res, 405, 'Méthode non autorisée');
  const user = await getBearerUser(req, supabase);
  if (!user) return safeError(res, 401, 'Non connecté');
  const { data, error } = await supabase
    .from('formation_bookings')
    .select('id, status, created_at, date_choisie, formations(titre, niveau, prix)')
    .eq('user_email', user.email)
    .order('created_at', { ascending: false });
  if (error) return safeError(res, 500, error.message);
  return res.status(200).json(data || []);
}

// ---- Galerie photos (public) ----
async function handleGalerie(req, res, supabase) {
  if (req.method !== 'GET') return safeError(res, 405, 'Méthode non autorisée');
  const { data, error } = await supabase.from('galerie').select('*').eq('visible', true).order('position', { ascending: true });
  if (error) return safeError(res, 500, error.message);
  return res.status(200).json(data || []);
}

// ---- Produits (public + admin) ----
async function handleProducts(req, res, supabase, id) {
  if (!id) {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) return safeError(res, 500, 'Erreur base de données');
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const admin = requireAdmin(req, res);
      if (!admin) return;

      const body   = req.body || {};
      const name   = str(body.name, 200);
      const priceV = price(body.price);
      if (!name) return safeError(res, 400, 'Le nom est requis');
      if (priceV === null) return safeError(res, 400, 'Prix invalide');

      const oldPriceV = body.old_price != null ? price(body.old_price) : null;
      const stockV    = int(body.stock, 0, 99999) ?? 0;
      const badge     = ALLOWED_BADGES.includes(body.badge)        ? (body.badge || null) : null;
      const category  = ALLOWED_CATEGORIES.includes(body.category) ? str(body.category)   : '';

      const { data, error } = await supabase.from('products').insert([{
        name, category, price: priceV, old_price: oldPriceV, stock: stockV, badge,
        image: str(body.image, 2000), sku: str(body.sku, 100), description: str(body.description, 2000),
        featured: !!body.featured, new_arrival: !!body.new_arrival, options: productOptions(body.options),
      }]).select().single();

      if (error) return safeError(res, 500, 'Erreur lors de la création');
      return res.status(201).json(data);
    }

    return safeError(res, 405, 'Méthode non autorisée');
  }

  // /api/products/:id
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) return safeError(res, 400, 'ID invalide');

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('products').select('*').eq('id', idNum).single();
    if (error || !data) return safeError(res, 404, 'Produit introuvable');
    return res.status(200).json(data);
  }

  const admin = requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'PUT') {
    const body   = req.body || {};
    const name   = str(body.name, 200);
    const priceV = price(body.price);
    if (!name) return safeError(res, 400, 'Le nom est requis');
    if (priceV === null) return safeError(res, 400, 'Prix invalide');

    const oldPriceV = body.old_price != null ? price(body.old_price) : null;
    const stockV    = int(body.stock, 0, 99999) ?? 0;
    const badge     = ALLOWED_BADGES.includes(body.badge)        ? (body.badge || null) : null;
    const category  = ALLOWED_CATEGORIES.includes(body.category) ? str(body.category)   : '';

    const { data, error } = await supabase.from('products').update({
      name, category, price: priceV, old_price: oldPriceV, stock: stockV, badge,
      image: str(body.image, 2000), sku: str(body.sku, 100), description: str(body.description, 2000),
      featured: !!body.featured, new_arrival: !!body.new_arrival, options: productOptions(body.options),
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
}

// ---- Connexion admin ----
async function handleAdminLogin(req, res, supabase) {
  if (req.method !== 'POST') return safeError(res, 405, 'Méthode non autorisée');

  try {
    const rawEmail    = email(req.body?.email);
    const rawPassword = password(req.body?.password);
    if (!rawEmail || !rawPassword) return safeError(res, 400, 'Identifiants invalides');

    const blocked = await checkRateLimit(`admin_login:${rawEmail}`);
    if (blocked) return safeError(res, 429, 'Trop de tentatives. Réessayez dans 15 minutes.');
    await recordAttempt(`admin_login:${rawEmail}`);

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY || !process.env.JWT_SECRET)
      return safeError(res, 500, 'Configuration serveur manquante');

    const { data: adminUser, error } = await supabase
      .from('admin_users').select('id, email, password_hash').eq('email', rawEmail).single();

    const dummyHash   = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCkQVB6T/V6Xa1F.ZzJVAFi';
    const hashToCheck = (error || !adminUser) ? dummyHash : adminUser.password_hash;
    const valid       = await bcrypt.compare(rawPassword, hashToCheck);
    if (error || !adminUser || !valid) return safeError(res, 401, 'Identifiants incorrects');

    const token = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.status(200).json({ token, email: adminUser.email });
  } catch { return safeError(res, 500, 'Erreur serveur'); }
}

// ---- Espace admin (tableau de bord) ----
async function handleAdmin(req, res, supabase, segments) {
  const route = segments[0] || '';
  const id    = segments[1] || null;

  if (route === 'login') return handleAdminLogin(req, res, supabase);

  const admin = requireAdmin(req, res);
  if (!admin) return;

  if (route === 'verify') {
    return res.status(200).json({ valid: true, email: admin.email });
  }

  if (route === 'users') {
    try {
      const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      if (error) return res.status(500).json({ error: error.message });
      const users = data?.users || [];
      const { data: profiles } = await supabase.from('profiles').select('id, points');
      const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
      return res.status(200).json(users.map(u => ({
        id: u.id, email: u.email,
        firstName: u.user_metadata?.firstName || '',
        lastName:  u.user_metadata?.lastName  || '',
        phone:     u.user_metadata?.phone     || '',
        points:    profileMap[u.id]?.points   || 0,
        confirmed: !!u.email_confirmed_at,
        banned:    !!u.banned_until || !!u.user_metadata?.banned,
        createdAt: u.created_at,
      })));
    } catch (err) { return safeError(res, 500, err.message); }
  }

  if (route === 'users-ban' && id) {
    if (req.method !== 'PUT') return safeError(res, 405, 'Méthode non autorisée');
    try {
      const { ban } = req.body || {};
      const banData = ban
        ? { banned_until: '2099-12-31T23:59:59Z' }
        : { banned_until: 'none' };
      const { error } = await supabase.auth.admin.updateUserById(id, ban ? { ban_duration: '876000h' } : { ban_duration: 'none' });
      if (error) return safeError(res, 500, error.message);
      return res.status(200).json({ success: true, banned: !!ban });
    } catch (err) { return safeError(res, 500, err.message); }
  }

  if (route === 'users-delete' && id) {
    if (req.method !== 'DELETE') return safeError(res, 405, 'Méthode non autorisée');
    try {
      await supabase.from('profiles').delete().eq('id', id);
      const { error } = await supabase.auth.admin.deleteUser(id);
      if (error) return safeError(res, 500, error.message);
      return res.status(200).json({ success: true });
    } catch (err) { return safeError(res, 500, err.message); }
  }

  if (route === 'update-password') {
    if (req.method !== 'PUT') return safeError(res, 405, 'Méthode non autorisée');
    try {
      const currentPassword = password(req.body?.currentPassword);
      const newPassword     = password(req.body?.newPassword);
      if (!currentPassword || !newPassword) return safeError(res, 400, 'Mot de passe invalide (minimum 6 caractères)');
      const { data: user } = await supabase.from('admin_users').select('password_hash').eq('id', admin.id).single();
      if (!user) return safeError(res, 404, 'Utilisateur introuvable');
      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) return safeError(res, 401, 'Mot de passe actuel incorrect');
      const hash = await bcrypt.hash(newPassword, 12);
      const { error } = await supabase.from('admin_users').update({ password_hash: hash }).eq('id', admin.id);
      if (error) return safeError(res, 500, 'Erreur serveur');
      return res.status(200).json({ success: true });
    } catch { return safeError(res, 500, 'Erreur serveur'); }
  }

  if (route === 'orders') {
    try {
      if (!id) {
        if (req.method !== 'GET') return safeError(res, 405, 'Méthode non autorisée');
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
      } else {
        if (req.method !== 'PUT') return safeError(res, 405, 'Méthode non autorisée');
        const { status } = req.body || {};
        if (!['validated', 'refused'].includes(status)) return res.status(400).json({ error: 'Statut invalide' });
        const { data: order, error: fetchErr } = await supabase.from('orders').select('*').eq('id', id).single();
        if (fetchErr || !order) return res.status(404).json({ error: 'Commande introuvable' });
        if (order.status !== 'pending') return res.status(400).json({ error: 'Commande déjà traitée' });
        const { error: updateErr } = await supabase.from('orders').update({ status }).eq('id', id);
        if (updateErr) return res.status(500).json({ error: updateErr.message });
        if (status === 'validated' && order.user_id && order.points_to_award > 0) {
          const { data: profile } = await supabase.from('profiles').select('points').eq('id', order.user_id).single();
          const newPts = (profile?.points || 0) + order.points_to_award;
          await supabase.from('profiles').upsert({ id: order.user_id, points: newPts }, { onConflict: 'id' });
        }
        return res.status(200).json({ success: true, status });
      }
    } catch { return safeError(res, 500, 'Erreur serveur'); }
  }

  if (route === 'formations') {
    try {
      if (!id) {
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
            titre: body.titre.trim(), duree: body.duree?.trim() || '',
            niveau: body.niveau?.trim() || 'Tous niveaux', prix: parseFloat(body.prix),
            description: body.description?.trim() || '',
            points: Array.isArray(body.points) ? body.points : [],
            dates: Array.isArray(body.dates) ? body.dates : [],
            places_max: parseInt(body.places_max) || 4, actif: body.actif !== false,
          }]).select().single();
          if (error) return res.status(500).json({ error: error.message });
          return res.status(201).json(data);
        }
        return safeError(res, 405, 'Méthode non autorisée');
      } else {
        if (req.method === 'PUT') {
          const body = req.body || {};
          const updates = {};
          if (body.titre       !== undefined) updates.titre       = body.titre.trim();
          if (body.duree       !== undefined) updates.duree       = body.duree.trim();
          if (body.niveau      !== undefined) updates.niveau      = body.niveau.trim();
          if (body.prix        !== undefined) updates.prix        = parseFloat(body.prix);
          if (body.description !== undefined) updates.description = body.description.trim();
          if (body.points      !== undefined) updates.points      = Array.isArray(body.points) ? body.points : [];
          if (body.dates       !== undefined) updates.dates       = Array.isArray(body.dates) ? body.dates : [];
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
        return safeError(res, 405, 'Méthode non autorisée');
      }
    } catch { return safeError(res, 500, 'Erreur serveur'); }
  }

  if (route === 'formation-bookings') {
    try {
      if (!id) {
        if (req.method !== 'GET') return safeError(res, 405, 'Méthode non autorisée');
        const { data, error } = await supabase
          .from('formation_bookings').select('*, formations(titre)').order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
      } else {
        if (req.method === 'PUT') {
          const { status } = req.body || {};
          if (!['confirmed', 'cancelled'].includes(status)) return res.status(400).json({ error: 'Statut invalide' });
          const { data, error } = await supabase.from('formation_bookings').update({ status }).eq('id', id).select().single();
          if (error) return res.status(500).json({ error: error.message });
          return res.status(200).json(data);
        }
        if (req.method === 'DELETE') {
          const { error } = await supabase.from('formation_bookings').delete().eq('id', id);
          if (error) return res.status(500).json({ error: error.message });
          return res.status(200).json({ success: true });
        }
        return safeError(res, 405, 'Méthode non autorisée');
      }
    } catch { return safeError(res, 500, 'Erreur serveur'); }
  }

  if (route === 'reviews') {
    try {
      if (!id) {
        if (req.method !== 'GET') return safeError(res, 405, 'Méthode non autorisée');
        const { data, error } = await supabase
          .from('reviews').select('*, products(name)').order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
      } else {
        if (req.method !== 'PUT') return safeError(res, 405, 'Méthode non autorisée');
        const { status } = req.body || {};
        if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Statut invalide' });
        const { data, error } = await supabase.from('reviews').update({ status }).eq('id', id).select('*, products(name)').single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
      }
    } catch { return safeError(res, 500, 'Erreur serveur'); }
  }

  if (route === 'popup-submissions') {
    try {
      if (req.method !== 'GET') return safeError(res, 405, 'Méthode non autorisée');
      const { data, error } = await supabase
        .from('popup_submissions').select('*').order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    } catch { return safeError(res, 500, 'Erreur serveur'); }
  }

  if (route === 'galerie') {
    try {
      if (!id) {
        if (req.method === 'GET') {
          const { data, error } = await supabase.from('galerie').select('*').order('position', { ascending: true });
          if (error) return res.status(500).json({ error: error.message });
          return res.status(200).json(data);
        }
        if (req.method === 'POST') {
          const body = req.body || {};
          if (!body.url?.trim()) return res.status(400).json({ error: 'URL image requise' });
          const { data, error } = await supabase.from('galerie').insert([{
            url: body.url.trim(),
            legende: body.legende?.trim() || '',
            position: parseInt(body.position) || 0,
            visible: body.visible !== false,
          }]).select().single();
          if (error) return res.status(500).json({ error: error.message });
          return res.status(201).json(data);
        }
        return safeError(res, 405, 'Méthode non autorisée');
      } else {
        if (req.method === 'PUT') {
          const body = req.body || {};
          const updates = {};
          if (body.url      !== undefined) updates.url      = body.url.trim();
          if (body.legende  !== undefined) updates.legende   = body.legende.trim();
          if (body.position !== undefined) updates.position  = parseInt(body.position) || 0;
          if (body.visible  !== undefined) updates.visible   = !!body.visible;
          const { data, error } = await supabase.from('galerie').update(updates).eq('id', id).select().single();
          if (error) return res.status(500).json({ error: error.message });
          return res.status(200).json(data);
        }
        if (req.method === 'DELETE') {
          const { error } = await supabase.from('galerie').delete().eq('id', id);
          if (error) return res.status(500).json({ error: error.message });
          return res.status(200).json({ success: true });
        }
        return safeError(res, 405, 'Méthode non autorisée');
      }
    } catch { return safeError(res, 500, 'Erreur serveur'); }
  }

  if (route === 'client-activity') {
    const { userId, userEmail } = req.query;
    if (!userId && !userEmail) return res.status(400).json({ error: 'userId ou userEmail requis' });
    try {
      const [ordersRes, bookingsRes, profileRes] = await Promise.all([
        userId ? supabase.from('orders').select('id,total,status,shipping_mode,shipping_address,points_to_award,created_at,items').eq('user_id', userId).order('created_at', { ascending: false }) : { data: [] },
        userEmail ? supabase.from('formation_bookings').select('id,status,created_at,formations(titre,niveau,prix)').eq('user_email', userEmail).order('created_at', { ascending: false }) : { data: [] },
        userId ? supabase.from('profiles').select('points').eq('id', userId).single() : { data: null },
      ]);
      return res.status(200).json({
        orders:   ordersRes.data   || [],
        bookings: bookingsRes.data || [],
        points:   profileRes.data?.points || 0,
      });
    } catch { return safeError(res, 500, 'Erreur serveur'); }
  }

  return res.status(404).json({ error: `Route inconnue : "${route}"` });
}

// ---- Dispatch principal ----
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // apiPath vient du rewrite vercel.json : /api/categories → apiPath=categories, /api/admin/orders/5 → apiPath=admin/orders/5
  const rawPath  = req.query.apiPath || '';
  const segments = rawPath.split('/').filter(Boolean);
  const [base, sub] = segments;
  const supabase = db();

  switch (base) {
    case 'categories':            return handleCategories(req, res);
    case 'create-payment-intent': return handlePaymentIntent(req, res);
    case 'formations':            return handleFormations(req, res, supabase);
    case 'formation-bookings':    return handleFormationBookings(req, res, supabase);
    case 'orders':                return handleOrders(req, res, supabase);
    case 'profile':               return handleProfile(req, res, supabase);
    case 'reviews':               return handleReviews(req, res, supabase);
    case 'products':              return handleProducts(req, res, supabase, sub);
    case 'popup-submissions':     return handlePopupSubmissions(req, res, supabase);
    case 'my-bookings':           return handleMyBookings(req, res, supabase);
    case 'galerie':               return handleGalerie(req, res, supabase);
    case 'admin':                 return handleAdmin(req, res, supabase, segments.slice(1));
    default:                      return safeError(res, 404, 'Route inconnue');
  }
};
