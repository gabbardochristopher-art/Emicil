const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { data, error } = await supabase
    .from('formations').select('*').eq('actif', true).order('id');
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
};
