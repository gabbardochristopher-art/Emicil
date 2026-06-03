// Rate limiting via Supabase (fonctionne en serverless)
// Max MAX_ATTEMPTS tentatives par WINDOW_MS millisecondes par identifiant

const { createClient } = require('@supabase/supabase-js');

const MAX_ATTEMPTS = 10;
const WINDOW_MS    = 15 * 60 * 1000; // 15 minutes

async function checkRateLimit(identifier) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const since    = new Date(Date.now() - WINDOW_MS).toISOString();

  const { count } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('identifier', identifier)
    .gte('attempted_at', since);

  return (count || 0) >= MAX_ATTEMPTS;
}

async function recordAttempt(identifier) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  await supabase.from('rate_limits').insert([{ identifier }]);

  // Nettoyage des anciens enregistrements (> 1 heure)
  const oldCutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  await supabase.from('rate_limits').delete().lt('attempted_at', oldCutoff);
}

module.exports = { checkRateLimit, recordAttempt };
