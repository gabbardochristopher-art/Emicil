// Redirige si déjà connecté
if (sessionStorage.getItem('admin_token')) {
  window.location.replace('dashboard.html');
}

// Toggle mot de passe
document.getElementById('toggle-pw').addEventListener('click', () => {
  const input = document.getElementById('password');
  const show  = document.getElementById('eye-show');
  const hide  = document.getElementById('eye-hide');
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  show.classList.toggle('hidden',  isHidden);
  hide.classList.toggle('hidden', !isHidden);
});

// Formulaire
document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const errorEl = document.getElementById('error-msg');
  const btnText = document.getElementById('btn-text');
  const btnLoad = document.getElementById('btn-loader');

  errorEl.classList.add('hidden');
  btnText.classList.add('hidden');
  btnLoad.classList.remove('hidden');

  try {
    const res  = await fetch('/api/admin/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email:    document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
      }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Erreur de connexion');

    sessionStorage.setItem('admin_token', data.token);
    sessionStorage.setItem('admin_email', data.email);
    window.location.replace('dashboard.html');
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
    btnText.classList.remove('hidden');
    btnLoad.classList.add('hidden');
  }
});
