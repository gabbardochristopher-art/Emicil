// =========================================================
//  ACCOUNT PAGE
// =========================================================

const AUTH_KEY = 'emicil_user';

function getUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; }
}
function saveUser(user) { localStorage.setItem(AUTH_KEY, JSON.stringify(user)); }
function clearUser()    { localStorage.removeItem(AUTH_KEY); }

function showDashboard(user) {
  document.getElementById('auth-forms').classList.add('hidden');
  document.getElementById('account-dashboard').classList.remove('hidden');
  document.getElementById('user-name').textContent = user.firstName || user.email;
}
function showAuthForms() {
  document.getElementById('auth-forms').classList.remove('hidden');
  document.getElementById('account-dashboard').classList.add('hidden');
}

// Tabs
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
    document.getElementById(`${tab.dataset.tab}-form`).classList.remove('hidden');
  });
});

// Login
document.getElementById('login-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const email    = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const stored   = getUser();
  if (stored && stored.email === email && stored.password === password) {
    showDashboard(stored);
    showToast('Connexion réussie');
  } else {
    showToast('Identifiants incorrects', 'error');
  }
});

// Register
document.getElementById('register-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const pw1 = document.getElementById('reg-password').value;
  const pw2 = document.getElementById('reg-password-confirm').value;
  if (pw1 !== pw2) { showToast('Les mots de passe ne correspondent pas', 'error'); return; }
  const user = {
    firstName: document.getElementById('reg-first-name').value,
    lastName:  document.getElementById('reg-last-name').value,
    email:     document.getElementById('reg-email').value,
    password:  pw1,
  };
  saveUser(user);
  showDashboard(user);
  showToast('Compte créé avec succès');
});

// Dashboard nav
document.querySelectorAll('.account-nav a[data-section]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.account-nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    document.querySelectorAll('.account-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(`section-${link.dataset.section}`).classList.remove('hidden');
  });
});

// Logout
document.getElementById('logout-btn')?.addEventListener('click', e => {
  e.preventDefault();
  clearUser();
  showAuthForms();
  showToast('Vous êtes déconnecté');
});

// Auto-login
const user = getUser();
if (user) showDashboard(user);
