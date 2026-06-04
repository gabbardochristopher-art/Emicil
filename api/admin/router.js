// ==========================================================================
//  EMICILS — Admin router (via vercel.json rewrite → /api/admin/router)
//  Reçoit adminPath=orders, adminPath=formations/5, etc.
// ==========================================================================

const bcrypt           = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const { requireAdmin } = require('../_lib/auth');
const { password, safeError } = require('../_lib/validate');

function db() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // adminPath vient du rewrite vercel.json : /api/admin/orders → adminPath=orders
  const rawPath  = req.query.adminPath || '';
  const segments = rawPath.split('/').filter(Boolean);
  const route    = segments[0] || '';
  const id       = segments[1] || null;

  // login géré par login.js dédié — ne devrait pas arriver ici
  if (route === 'login') return safeError(res, 404, 'Utiliser /api/admin/login');

  const admin = requireAdmin(req, res);
  if (!admin) return;

  const supabase = db();

  // ---- Verify ----
  if (route === 'verify') {
    return res.status(200).json({ valid: true, email: admin.email });
  }

  // ---- Users ----
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
        createdAt: u.created_at,
      })));
    } catch (err) { return safeError(res, 500, err.message); }
  }

  // ---- Update password ----
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

  // ---- Orders ----
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

  // ---- Formations ----
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

  // ---- Formation bookings ----
  if (route === 'formation-bookings') {
    try {
      if (!id) {
        if (req.method !== 'GET') return safeError(res, 405, 'Méthode non autorisée');
        const { data, error } = await supabase
          .from('formation_bookings').select('*, formations(titre)').order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
      } else {
        if (req.method !== 'PUT') return safeError(res, 405, 'Méthode non autorisée');
        const { status } = req.body || {};
        if (!['confirmed', 'cancelled'].includes(status)) return res.status(400).json({ error: 'Statut invalide' });
        const { data, error } = await supabase.from('formation_bookings').update({ status }).eq('id', id).select().single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
      }
    } catch { return safeError(res, 500, 'Erreur serveur'); }
  }

  return res.status(404).json({ error: `Route inconnue : "${route}"` });
};
