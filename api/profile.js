const { createClient } = require('@supabase/supabase-js');
const { safeError } = require('./_lib/validate');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = (req.headers.authorization || '');
  if (!auth.startsWith('Bearer ')) return safeError(res, 401, 'Non connecté');

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  // Vérifie le token Supabase et récupère l'utilisateur
  const { data: { user }, error } = await supabase.auth.getUser(auth.slice(7));
  if (error || !user) return safeError(res, 401, 'Session invalide');

  // Récupère le profil — crée-le s'il n'existe pas encore
  let { data: profile } = await supabase
    .from('profiles').select('points').eq('id', user.id).single();

  if (!profile) {
    const { data: created } = await supabase
      .from('profiles')
      .upsert({ id: user.id, points: 0 }, { onConflict: 'id' })
      .select('points').single();
    profile = created;
  }

  return res.status(200).json({ points: profile?.points ?? 0 });
};
