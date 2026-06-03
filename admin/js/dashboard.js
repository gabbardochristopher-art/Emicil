// =========================================================
//  ADMIN DASHBOARD
// =========================================================

const token = sessionStorage.getItem('admin_token');
if (!token) window.location.replace('index.html');

const API = '/api';
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });

// Vérifie la session + charge les catégories
(async () => {
  const [verifyRes, catsRes] = await Promise.all([
    fetch(`${API}/admin/verify`, { headers: headers() }),
    fetch(`${API}/categories`),
  ]);
  if (!verifyRes.ok) { sessionStorage.clear(); window.location.replace('index.html'); }
  document.getElementById('admin-email-display').textContent = sessionStorage.getItem('admin_email') || '';

  if (catsRes.ok) {
    const cats = await catsRes.json();
    const select = document.getElementById('p-category');
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.label;
      select.appendChild(opt);
    });
  }
})();

// ---- Navigation ----
const navLinks   = document.querySelectorAll('.nav-link');
const sections   = document.querySelectorAll('.admin-section');
const pageTitle  = document.getElementById('page-title');
const TITLES = { overview: 'Tableau de bord', products: 'Produits', orders: 'Commandes', settings: 'Paramètres' };

function showSection(name) {
  navLinks.forEach(l  => l.classList.toggle('active', l.dataset.section === name));
  sections.forEach(s  => s.classList.toggle('hidden', s.id !== `section-${name}`));
  pageTitle.textContent = TITLES[name] || name;
  if (name === 'overview') loadStats();
  if (name === 'products') loadProducts();
  if (name === 'orders')   loadOrders();
}

navLinks.forEach(link => link.addEventListener('click', e => { e.preventDefault(); showSection(link.dataset.section); }));

// ---- Logout ----
document.getElementById('logout-btn').addEventListener('click', () => {
  sessionStorage.clear();
  window.location.replace('index.html');
});

// =========================================================
//  OVERVIEW
// =========================================================
async function loadStats() {
  const [prodRes, ordRes] = await Promise.all([
    fetch(`${API}/products`),
    fetch(`${API}/admin/orders`, { headers: headers() }),
  ]);
  const prods  = prodRes.ok  ? await prodRes.json()  : [];
  const orders = ordRes.ok   ? await ordRes.json()   : [];
  document.getElementById('stat-products').textContent = prods.length;
  document.getElementById('stat-featured').textContent = prods.filter(p => p.featured).length;
  document.getElementById('stat-stock').textContent    = prods.reduce((s, p) => s + (p.stock || 0), 0);

  const pending = orders.filter(o => o.status === 'pending').length;
  const badge   = document.getElementById('orders-badge');
  if (pending > 0) { badge.textContent = pending; badge.style.display = 'inline'; }
  else badge.style.display = 'none';
}

// =========================================================
//  ORDERS
// =========================================================
let allOrders = [];
let orderFilter = 'pending';

async function loadOrders() {
  const tbody = document.getElementById('orders-tbody');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#7b7f93;padding:28px">Chargement…</td></tr>';
  const res = await fetch(`${API}/admin/orders`, { headers: headers() });
  if (!res.ok) { tbody.innerHTML = '<tr><td colspan="8" style="color:red;padding:16px">Erreur.</td></tr>'; return; }
  allOrders = await res.json();
  renderOrders();
}

function renderOrders() {
  const tbody = document.getElementById('orders-tbody');
  const list  = orderFilter === 'all' ? allOrders : allOrders.filter(o => o.status === orderFilter);
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#7b7f93;padding:28px">Aucune commande.</td></tr>`;
    return;
  }
  const STATUS = { pending: '⏳ En attente', validated: '✓ Validée', refused: '✗ Refusée' };
  const MODE   = { collect: 'Click & Collect', relais: 'Point relais', domicile: 'Domicile' };
  tbody.innerHTML = list.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.user_name || o.user_email}</td>
      <td>${new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
      <td>${MODE[o.shipping_mode] || o.shipping_mode}</td>
      <td>${Number(o.total).toFixed(2)} €</td>
      <td style="color:#b08d57">${o.points_to_award} pts</td>
      <td><span class="badge badge-${o.status === 'pending' ? 'new' : o.status === 'validated' ? 'oui' : 'non'}">${STATUS[o.status]}</span></td>
      <td>
        ${o.status === 'pending' ? `
          <button class="btn-action btn-edit"   onclick="processOrder('${o.id}','validated')">Valider</button>
          <button class="btn-action btn-delete" onclick="processOrder('${o.id}','refused')">Refuser</button>
        ` : '—'}
      </td>
    </tr>`).join('');
}

async function processOrder(id, status) {
  const label = status === 'validated' ? 'Valider' : 'Refuser';
  if (!confirm(`${label} la commande ${id} ?`)) return;
  const res  = await fetch(`${API}/admin/orders/${id}`, {
    method: 'PUT', headers: headers(), body: JSON.stringify({ status })
  });
  if (res.ok) { loadOrders(); loadStats(); }
  else alert('Erreur lors du traitement.');
}

document.querySelectorAll('.order-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.order-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    orderFilter = btn.dataset.filter;
    renderOrders();
  });
});

// =========================================================
//  PRODUCTS
// =========================================================
let allProducts = [];

async function loadProducts() {
  const tbody = document.getElementById('products-tbody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#7b7f93;padding:28px">Chargement…</td></tr>';

  const res = await fetch(`${API}/products`);
  if (!res.ok) { tbody.innerHTML = '<tr><td colspan="7" style="color:red;padding:16px">Erreur de chargement.</td></tr>'; return; }

  allProducts = await res.json();
  renderTable(allProducts);
}

function renderTable(products) {
  const tbody = document.getElementById('products-tbody');
  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#7b7f93;padding:28px">Aucun produit. Ajoutez-en un !</td></tr>';
    return;
  }
  tbody.innerHTML = products.map(p => `
    <tr>
      <td style="color:#7b7f93">#${p.id}</td>
      <td><strong>${p.name}</strong></td>
      <td>${p.category || '—'}</td>
      <td>${formatPrice(p.price)}</td>
      <td>${p.stock ?? 0}</td>
      <td><span class="badge badge-${p.featured ? 'oui' : 'non'}">${p.featured ? 'Oui' : 'Non'}</span></td>
      <td>
        <button class="btn-action btn-edit" onclick="openEdit(${p.id})">Modifier</button>
        <button class="btn-action btn-delete" onclick="deleteProduct(${p.id})">Supprimer</button>
      </td>
    </tr>`).join('');
}

function formatPrice(price) {
  return Number(price).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

// Recherche
document.getElementById('search-products').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  renderTable(allProducts.filter(p => p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q)));
});

// =========================================================
//  MODAL PRODUIT
// =========================================================
const modal      = document.getElementById('product-modal');
const form       = document.getElementById('product-form');
const modalError = document.getElementById('modal-error');

function openModal(title) {
  document.getElementById('modal-title').textContent = title;
  modalError.classList.add('hidden');
  modal.classList.remove('hidden');
}

function closeModal() { modal.classList.add('hidden'); form.reset(); }

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-cancel').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

// Nouveau produit
document.getElementById('btn-add-product').addEventListener('click', () => {
  document.getElementById('product-id').value = '';
  openModal('Nouveau produit');
});

// Modifier
function openEdit(id) {
  const p = allProducts.find(p => p.id === id);
  if (!p) return;
  document.getElementById('product-id').value      = p.id;
  document.getElementById('p-name').value          = p.name || '';
  document.getElementById('p-category').value      = p.category || '';
  // force la sélection au cas où le DOM n'est pas encore à jour
  const catOpt = document.querySelector(`#p-category option[value="${p.category}"]`);
  if (catOpt) catOpt.selected = true;
  document.getElementById('p-price').value         = p.price || '';
  document.getElementById('p-old-price').value     = p.old_price || '';
  document.getElementById('p-stock').value         = p.stock ?? 0;
  document.getElementById('p-badge').value         = p.badge || '';
  document.getElementById('p-image').value         = p.image || '';
  document.getElementById('p-sku').value           = p.sku || '';
  document.getElementById('p-description').value   = p.description || '';
  document.getElementById('p-featured').checked    = !!p.featured;
  document.getElementById('p-new-arrival').checked = !!p.new_arrival;
  openModal('Modifier le produit');
}

// Soumettre le formulaire
form.addEventListener('submit', async e => {
  e.preventDefault();
  const id  = document.getElementById('product-id').value;
  const submitBtn = document.getElementById('modal-submit');
  submitBtn.textContent = 'Enregistrement…';
  submitBtn.disabled = true;

  const body = {
    name:        document.getElementById('p-name').value.trim(),
    category:    document.getElementById('p-category').value.trim(),
    price:       parseFloat(document.getElementById('p-price').value),
    old_price:   parseFloat(document.getElementById('p-old-price').value) || null,
    stock:       parseInt(document.getElementById('p-stock').value) || 0,
    badge:       document.getElementById('p-badge').value || null,
    image:       document.getElementById('p-image').value.trim(),
    sku:         document.getElementById('p-sku').value.trim(),
    description: document.getElementById('p-description').value.trim(),
    featured:    document.getElementById('p-featured').checked,
    new_arrival: document.getElementById('p-new-arrival').checked,
  };

  const url    = id ? `${API}/products/${id}` : `${API}/products`;
  const method = id ? 'PUT' : 'POST';
  const res    = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) });
  const data   = await res.json();

  submitBtn.textContent = 'Enregistrer';
  submitBtn.disabled = false;

  if (!res.ok) {
    modalError.textContent = data.error || 'Erreur';
    modalError.classList.remove('hidden');
    return;
  }
  closeModal();
  loadProducts();
});

// Supprimer
async function deleteProduct(id) {
  if (!confirm('Supprimer ce produit ? Cette action est irréversible.')) return;
  const res = await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: headers() });
  if (res.ok) loadProducts();
  else alert('Erreur lors de la suppression.');
}

// =========================================================
//  SETTINGS — changement de mot de passe
// =========================================================
document.getElementById('password-form').addEventListener('submit', async e => {
  e.preventDefault();
  const errEl  = document.getElementById('pw-error');
  const sucEl  = document.getElementById('pw-success');
  errEl.classList.add('hidden');
  sucEl.classList.add('hidden');

  const newPw  = document.getElementById('new-pw').value;
  const confPw = document.getElementById('confirm-pw').value;
  if (newPw !== confPw) { errEl.textContent = 'Les mots de passe ne correspondent pas.'; errEl.classList.remove('hidden'); return; }

  const res  = await fetch(`${API}/admin/update-password`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ currentPassword: document.getElementById('current-pw').value, newPassword: newPw }),
  });
  const data = await res.json();
  if (!res.ok) { errEl.textContent = data.error || 'Erreur'; errEl.classList.remove('hidden'); return; }

  sucEl.classList.remove('hidden');
  e.target.reset();
});

// Init
showSection('overview');
