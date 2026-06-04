const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { formation_id, user_email, user_name, user_phone, message } = req.body || {};

  if (!formation_id || !user_email?.trim()) {
    return res.status(400).json({ error: 'Formation et email requis' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user_email.trim())) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const { data, error } = await supabase.from('formation_bookings').insert([{
    formation_id: parseInt(formation_id),
    user_email:   user_email.trim(),
    user_name:    user_name?.trim() || '',
    user_phone:   user_phone?.trim() || '',
    message:      message?.trim() || '',
  }]).select().single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
};
