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

// Renvoie toujours une erreur générique pour ne pas révéler d'infos
function safeError(res, status, msg) {
  return res.status(status).json({ error: msg });
}

module.exports = { str, email, price, int, password, safeError };
