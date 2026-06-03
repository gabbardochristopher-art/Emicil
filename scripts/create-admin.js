/**
 * Créer le premier compte admin dans Supabase.
 *
 * Usage :
 *   1. Copiez .env.example en .env.local et remplissez les valeurs
 *   2. npm install
 *   3. node scripts/create-admin.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt  = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = q => new Promise(resolve => rl.question(q, resolve));

async function main() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  console.log('\n=== Création du compte admin Emicil ===\n');
  const email    = await ask('Email admin : ');
  const password = await ask('Mot de passe (min 6 caractères) : ');
  rl.close();

  if (!email || password.length < 6) {
    console.error('Email ou mot de passe invalide.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  const { error } = await supabase
    .from('admin_users')
    .insert([{ email: email.toLowerCase().trim(), password_hash: hash }]);

  if (error) {
    console.error('Erreur :', error.message);
    process.exit(1);
  }

  console.log(`\n✓ Admin "${email}" créé avec succès.`);
  console.log('  Rendez-vous sur /admin pour vous connecter.\n');
}

main();
