// Validation & sanitisation des entrées API

function str(val, max = 500) {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, max);
}

function email(val) {
  const s = str(val, 254);
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? s.toLowerCase() : null;
}

function price(val) {
  const n = parseFloat(val);
  if (isNaN(n) || n < 0 || n > 99999) return null;
  return Math.round(n * 100) / 100;
}

function int(val, min = 0, max = 999999) {
  const n = parseInt(val, 10);
  if (isNaN(n) || n < min || n > max) return null;
  return n;
}

function password(val) {
  const s = str(val, 128);
  return s.length >= 6 ? s : null;
}

// Sanitise un objet d'options produit, ex. { Courbure: ["C","CC"], Longueur: ["8mm","9mm"] }
// — clés et valeurs limitées en taille/nombre pour éviter tout abus.
function productOptions(val) {
  if (!val || typeof val !== 'object' || Array.isArray(val)) return null;
  const out = {};
  for (const [key, list] of Object.entries(val)) {
    const k = str(key, 60);
    if (!k || !Array.isArray(list)) continue;
    const vals = list.map(v => str(v, 40)).filter(Boolean).slice(0, 30);
    if (vals.length) out[k] = vals;
  }
  return Object.keys(out).length ? out : null;
}

// Renvoie toujours une erreur générique pour ne pas révéler d'infos
function safeError(res, status, msg) {
  return res.status(status).json({ error: msg });
}

module.exports = { str, email, price, int, password, productOptions, safeError };
