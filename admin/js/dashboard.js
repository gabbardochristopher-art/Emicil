// =========================================================
//  ADMIN DASHBOARD — v2 formations
// =========================================================

function esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

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
const TITLES = { overview: 'Tableau de bord', clients: 'Clients', products: 'Produits', orders: 'Commandes', formations: 'Formations', settings: 'Paramètres' };

function showSection(name) {
  navLinks.forEach(l  => l.classList.toggle('active', l.dataset.section === name));
  sections.forEach(s  => s.classList.toggle('hidden', s.id !== `section-${name}`));
  pageTitle.textContent = TITLES[name] || name;
  if (name === 'overview')   loadStats();
  if (name === 'clients')    loadClients();
  if (name === 'products')   loadProducts();
  if (name === 'orders')     loadOrders();
  if (name === 'formations') loadFormations();
}

navLinks.forEach(link => link.addEventListener('click', e => { e.preventDefault(); showSection(link.dataset.section); }));

// ---- Logout ----
document.getElementById('logout-btn').addEventListener('click', () => {
  sessionStorage.clear();
  window.location.replace('index.html');
});

// =========================================================
//  CLIENTS
// =========================================================
let allClients = [];

async function loadClients() {
  const tbody = document.getElementById('clients-tbody');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#7b7f93;padding:28px">Chargement…</td></tr>';

  const res = await fetch(`${API}/admin/users`, { headers: headers() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    tbody.innerHTML = `<tr><td colspan="6" style="color:red;padding:16px">Erreur ${res.status} : ${err.error || res.statusText}</td></tr>`;
    return;
  }

  allClients = await res.json();
  document.getElementById('clients-count').textContent = `${allClients.length} client(s) inscrit(s)`;
  renderClients(allClients);
}

function renderClients(list) {
  const tbody = document.getElementById('clients-tbody');
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#7b7f93;padding:28px">Aucun client inscrit.</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(u => `
    <tr>
      <td><strong>${esc(u.firstName) || '—'} ${esc(u.lastName)}</strong></td>
      <td>${esc(u.email)}</td>
      <td>${esc(u.phone) || '—'}</td>
      <td style="color:#b08d57;font-weight:600">${u.points} pts</td>
      <td><span class="badge badge-${u.confirmed ? 'oui' : 'non'}">${u.confirmed ? '✓ Oui' : '✗ Non'}</span></td>
      <td style="color:#7b7f93">${new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
      <td><button class="btn-action btn-edit" data-user-id="${esc(u.id)}" data-user-email="${esc(u.email)}" data-user-name="${esc(u.firstName)}">Activité</button></td>
    </tr>`).join('');
}

document.getElementById('search-clients')?.addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  renderClients(allClients.filter(u =>
    u.email.toLowerCase().includes(q) ||
    (u.firstName + ' ' + u.lastName).toLowerCase().includes(q) ||
    (u.phone || '').includes(q)
  ));
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
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    tbody.innerHTML = `<tr><td colspan="8" style="color:red;padding:16px">Erreur ${res.status} : ${err.error || res.statusText}</td></tr>`;
    return;
  }
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
      <td><strong>${esc(o.id)}</strong></td>
      <td>${esc(o.user_name || o.user_email)}</td>
      <td>${new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
      <td>${MODE[o.shipping_mode] || esc(o.shipping_mode)}</td>
      <td>${Number(o.total).toFixed(2)} €</td>
      <td style="color:#b08d57">${o.points_to_award} pts</td>
      <td><span class="badge badge-${o.status === 'pending' ? 'new' : o.status === 'validated' ? 'oui' : 'non'}">${STATUS[o.status]}</span></td>
      <td>
        ${o.status === 'pending' ? `
          <button class="btn-action btn-edit"   data-id="${esc(o.id)}" data-action="validated">Valider</button>
          <button class="btn-action btn-delete" data-id="${esc(o.id)}" data-action="refused">Refuser</button>
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

document.getElementById('orders-tbody')?.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (btn) processOrder(btn.dataset.id, btn.dataset.action);
});

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
document.getElementById('search-products')?.addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  renderTable(allProducts.filter(p => p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q)));
});

// =========================================================
//  MODAL PRODUIT
// =========================================================
const modal      = document.getElementById('product-modal');
const form       = document.getElementById('product-form');
const modalError = document.getElementById('modal-error');

// Champs courbure/longueur — visibles uniquement pour la catégorie "Extensions de cil"
const lashFieldsEls = [document.getElementById('p-lash-options'), document.getElementById('p-lash-options-2')];
function toggleLashFields() {
  const isLash = document.getElementById('p-category').value === 'extensions';
  lashFieldsEls.forEach(el => el.classList.toggle('hidden', !isLash));
}
document.getElementById('p-category').addEventListener('change', toggleLashFields);

function parseOptionList(value) {
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

function buildOptions() {
  if (document.getElementById('p-category').value !== 'extensions') return null;
  const courbures = parseOptionList(document.getElementById('p-curvatures').value);
  const longueurs = parseOptionList(document.getElementById('p-lengths').value);
  const options = {};
  if (courbures.length) options.Courbure = courbures;
  if (longueurs.length) options.Longueur = longueurs;
  return Object.keys(options).length ? options : null;
}

function openModal(title) {
  document.getElementById('modal-title').textContent = title;
  modalError.classList.add('hidden');
  modal.classList.remove('hidden');
  toggleLashFields();
}

function closeModal() { modal.classList.add('hidden'); form.reset(); toggleLashFields(); }

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
  document.getElementById('p-curvatures').value    = (p.options?.Courbure || []).join(', ');
  document.getElementById('p-lengths').value       = (p.options?.Longueur || []).join(', ');
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
    options:     buildOptions(),
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
//  FORMATIONS
// =========================================================
let allFormations = [];

async function loadFormations() {
  const tbody = document.getElementById('formations-tbody');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#7b7f93;padding:28px">Chargement…</td></tr>';
  const res = await fetch(`${API}/admin/formations`, { headers: headers() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    tbody.innerHTML = `<tr><td colspan="8" style="color:red;padding:16px">Erreur ${res.status} : ${err.error || res.statusText}</td></tr>`;
    return;
  }
  allFormations = await res.json();
  renderFormations();
}

function renderFormations() {
  const tbody = document.getElementById('formations-tbody');
  if (!allFormations.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#7b7f93;padding:28px">Aucune formation. Ajoutez-en une !</td></tr>';
    return;
  }
  tbody.innerHTML = allFormations.map(f => `
    <tr>
      <td style="color:#7b7f93">#${f.id}</td>
      <td><strong>${esc(f.titre)}</strong></td>
      <td>${esc(f.niveau) || '—'}</td>
      <td>${formatPrice(f.prix)}</td>
      <td style="color:#7b7f93">${esc(f.duree) || '—'}</td>
      <td>${f.places_max}</td>
      <td><span class="badge badge-${f.actif ? 'oui' : 'non'}">${f.actif ? '✓ Oui' : '✗ Non'}</span></td>
      <td>
        <button class="btn-action btn-edit"   data-id="${f.id}" data-formation-action="edit">Modifier</button>
        <button class="btn-action btn-delete" data-id="${f.id}" data-formation-action="delete">Supprimer</button>
      </td>
    </tr>`).join('');
}

// ---- Modal formation ----
const formationModal      = document.getElementById('formation-modal');
const formationForm       = document.getElementById('formation-form');
const formationModalError = document.getElementById('formation-modal-error');

function openFormationModal(title) {
  document.getElementById('formation-modal-title').textContent = title;
  formationModalError.classList.add('hidden');
  formationModal.classList.remove('hidden');
}
function closeFormationModal() { formationModal.classList.add('hidden'); formationForm.reset(); }

document.getElementById('formation-modal-close').addEventListener('click', closeFormationModal);
document.getElementById('formation-modal-cancel').addEventListener('click', closeFormationModal);
formationModal.addEventListener('click', e => { if (e.target === formationModal) closeFormationModal(); });

document.getElementById('btn-add-formation').addEventListener('click', () => {
  document.getElementById('f-id').value = '';
  document.getElementById('f-actif').checked = true;
  openFormationModal('Nouvelle formation');
});

function openFormationEdit(id) {
  const f = allFormations.find(f => f.id === id);
  if (!f) return;
  document.getElementById('f-id').value          = f.id;
  document.getElementById('f-titre').value        = f.titre || '';
  document.getElementById('f-duree').value        = f.duree || '';
  document.getElementById('f-niveau').value       = f.niveau || 'Tous niveaux';
  document.getElementById('f-prix').value         = f.prix || '';
  document.getElementById('f-places').value       = f.places_max || 4;
  document.getElementById('f-description').value  = f.description || '';
  document.getElementById('f-points').value       = (f.points || []).join('\n');
  document.getElementById('f-actif').checked      = !!f.actif;
  openFormationModal('Modifier la formation');
}

formationForm.addEventListener('submit', async e => {
  e.preventDefault();
  const id        = document.getElementById('f-id').value;
  const submitBtn = document.getElementById('formation-modal-submit');
  submitBtn.textContent = 'Enregistrement…';
  submitBtn.disabled    = true;

  const pointsRaw = document.getElementById('f-points').value.trim();
  const points    = pointsRaw ? pointsRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];

  const body = {
    titre:       document.getElementById('f-titre').value.trim(),
    duree:       document.getElementById('f-duree').value.trim(),
    niveau:      document.getElementById('f-niveau').value,
    prix:        parseFloat(document.getElementById('f-prix').value),
    places_max:  parseInt(document.getElementById('f-places').value) || 4,
    description: document.getElementById('f-description').value.trim(),
    points,
    actif:       document.getElementById('f-actif').checked,
  };

  const url    = id ? `${API}/admin/formations/${id}` : `${API}/admin/formations`;
  const method = id ? 'PUT' : 'POST';
  const res    = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) });
  const data   = await res.json();

  submitBtn.textContent = 'Enregistrer';
  submitBtn.disabled    = false;

  if (!res.ok) {
    formationModalError.textContent = data.error || 'Erreur';
    formationModalError.classList.remove('hidden');
    return;
  }
  closeFormationModal();
  loadFormations();
});

async function deleteFormation(id) {
  if (!confirm('Supprimer cette formation ? Les réservations associées seront aussi supprimées.')) return;
  const res = await fetch(`${API}/admin/formations/${id}`, { method: 'DELETE', headers: headers() });
  if (res.ok) loadFormations();
  else alert('Erreur lors de la suppression.');
}

// ---- Event délégué formations (remplace les onclick inline) ----
document.getElementById('formations-tbody')?.addEventListener('click', e => {
  const btn = e.target.closest('[data-formation-action]');
  if (!btn) return;
  const id = parseInt(btn.dataset.id);
  if (btn.dataset.formationAction === 'edit')   openFormationEdit(id);
  if (btn.dataset.formationAction === 'delete') deleteFormation(id);
});

// ---- Sous-onglets formations / réservations ----
document.querySelectorAll('.formation-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.formation-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const isBookings = btn.dataset.tab === 'bookings';
    document.getElementById('formations-list-view').classList.toggle('hidden', isBookings);
    document.getElementById('btn-add-formation').style.display = isBookings ? 'none' : '';
    document.getElementById('formations-bookings-view').classList.toggle('hidden', !isBookings);
    if (isBookings) loadBookings();
  });
});

// =========================================================
//  RÉSERVATIONS FORMATIONS
// =========================================================
let allBookings   = [];
let bookingFilter = 'pending';

async function loadBookings() {
  const tbody = document.getElementById('bookings-tbody');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#7b7f93;padding:28px">Chargement…</td></tr>';
  const res = await fetch(`${API}/admin/formation-bookings`, { headers: headers() });
  if (!res.ok) { tbody.innerHTML = '<tr><td colspan="8" style="color:red;padding:16px">Erreur.</td></tr>'; return; }
  allBookings = await res.json();

  const pending = allBookings.filter(b => b.status === 'pending').length;
  const badge   = document.getElementById('bookings-badge');
  if (pending > 0) { badge.textContent = pending; badge.style.display = 'inline'; }
  else badge.style.display = 'none';

  renderBookings();
}

function renderBookings() {
  const tbody = document.getElementById('bookings-tbody');
  const list  = bookingFilter === 'all' ? allBookings : allBookings.filter(b => b.status === bookingFilter);
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#7b7f93;padding:28px">Aucune réservation.</td></tr>`;
    return;
  }
  const STATUS = { pending: '⏳ En attente', confirmed: '✓ Confirmée', cancelled: '✗ Annulée' };
  tbody.innerHTML = list.map(b => `
    <tr>
      <td><strong>${esc(b.formations?.titre) || '—'}</strong></td>
      <td>${esc(b.user_name) || '—'}</td>
      <td>${esc(b.user_email)}</td>
      <td>${esc(b.user_phone) || '—'}</td>
      <td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#7b7f93">${esc(b.message) || '—'}</td>
      <td><span class="badge badge-${b.status === 'pending' ? 'new' : b.status === 'confirmed' ? 'oui' : 'non'}">${STATUS[b.status] || esc(b.status)}</span></td>
      <td style="color:#7b7f93">${new Date(b.created_at).toLocaleDateString('fr-FR')}</td>
      <td>
        ${b.status === 'pending' ? `
          <button class="btn-action btn-edit"   data-id="${b.id}" data-booking-action="confirmed">Confirmer</button>
          <button class="btn-action btn-delete" data-id="${b.id}" data-booking-action="cancelled">Annuler</button>
        ` : '—'}
      </td>
    </tr>`).join('');
}

async function updateBooking(id, status) {
  const label = status === 'confirmed' ? 'Confirmer' : 'Annuler';
  if (!confirm(`${label} cette réservation ?`)) return;
  const res = await fetch(`${API}/admin/formation-bookings/${id}`, {
    method: 'PUT', headers: headers(), body: JSON.stringify({ status })
  });
  if (res.ok) loadBookings();
  else alert('Erreur lors du traitement.');
}

document.getElementById('bookings-tbody')?.addEventListener('click', e => {
  const btn = e.target.closest('[data-booking-action]');
  if (btn) updateBooking(btn.dataset.id, btn.dataset.bookingAction);
});

document.querySelectorAll('.booking-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.booking-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    bookingFilter = btn.dataset.filter;
    renderBookings();
  });
});

// =========================================================
//  ACTIVITÉ FIDÉLITÉ CLIENT
// =========================================================
const activityModal    = document.getElementById('activity-modal');
const activityModalBody = document.getElementById('activity-modal-body');

document.getElementById('activity-modal-close')?.addEventListener('click', () => activityModal.classList.add('hidden'));
activityModal?.addEventListener('click', e => { if (e.target === activityModal) activityModal.classList.add('hidden'); });

document.getElementById('clients-tbody')?.addEventListener('click', async e => {
  const btn = e.target.closest('[data-user-id]');
  if (!btn) return;
  const userId    = btn.dataset.userId;
  const userEmail = btn.dataset.userEmail;
  const userName  = btn.dataset.userName || userEmail;
  document.getElementById('activity-modal-title').textContent = `Activité — ${esc(userName)}`;
  activityModalBody.innerHTML = '<p style="color:#7b7f93;text-align:center;padding:24px">Chargement…</p>';
  activityModal.classList.remove('hidden');

  const res = await fetch(`${API}/admin/client-activity?userId=${encodeURIComponent(userId)}&userEmail=${encodeURIComponent(userEmail)}`, { headers: headers() });
  if (!res.ok) { activityModalBody.innerHTML = '<p style="color:red;padding:16px">Erreur lors du chargement.</p>'; return; }
  const { orders, bookings, points } = await res.json();

  const STATUS_O = { pending: '⏳ En attente', validated: '✓ Validée', refused: '✗ Refusée' };
  const STATUS_B = { pending: '⏳ En attente', confirmed: '✓ Confirmée', cancelled: '✗ Annulée' };
  const MODE     = { collect: 'Click & Collect', relais: 'Point relais', domicile: 'Domicile' };

  activityModalBody.innerHTML = `
    <!-- Points -->
    <div style="background:#1a1d27;border-radius:8px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;">
      <span style="color:#7b7f93;font-size:.85rem;text-transform:uppercase;letter-spacing:.08em;">Points fidélité</span>
      <span style="color:#b08d57;font-size:1.4rem;font-weight:600;">${points} pts</span>
    </div>

    <!-- Commandes -->
    <h3 style="font-size:.85rem;text-transform:uppercase;letter-spacing:.1em;color:#7b7f93;margin:0 0 10px;">Commandes (${orders.length})</h3>
    ${orders.length ? `
    <table class="admin-table" style="margin-bottom:24px;">
      <thead><tr><th>Réf.</th><th>Date</th><th>Mode</th><th>Total</th><th>Points</th><th>Statut</th></tr></thead>
      <tbody>${orders.map(o => `
        <tr>
          <td><strong>${esc(o.id)}</strong></td>
          <td style="color:#7b7f93">${new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
          <td>${MODE[o.shipping_mode] || esc(o.shipping_mode)}</td>
          <td>${Number(o.total).toFixed(2)} €</td>
          <td style="color:#b08d57">+${o.points_to_award} pts</td>
          <td><span class="badge badge-${o.status === 'pending' ? 'new' : o.status === 'validated' ? 'oui' : 'non'}">${STATUS_O[o.status] || o.status}</span></td>
        </tr>`).join('')}
      </tbody>
    </table>` : '<p style="color:#7b7f93;font-size:.85rem;margin-bottom:20px;">Aucune commande.</p>'}

    <!-- Réservations formations -->
    <h3 style="font-size:.85rem;text-transform:uppercase;letter-spacing:.1em;color:#7b7f93;margin:0 0 10px;">Réservations formations (${bookings.length})</h3>
    ${bookings.length ? `
    <table class="admin-table">
      <thead><tr><th>Formation</th><th>Niveau</th><th>Date</th><th>Statut</th></tr></thead>
      <tbody>${bookings.map(b => `
        <tr>
          <td><strong>${esc(b.formations?.titre || '—')}</strong></td>
          <td style="color:#7b7f93">${esc(b.formations?.niveau || '—')}</td>
          <td style="color:#7b7f93">${new Date(b.created_at).toLocaleDateString('fr-FR')}</td>
          <td><span class="badge badge-${b.status === 'pending' ? 'new' : b.status === 'confirmed' ? 'oui' : 'non'}">${STATUS_B[b.status] || b.status}</span></td>
        </tr>`).join('')}
      </tbody>
    </table>` : '<p style="color:#7b7f93;font-size:.85rem;">Aucune réservation de formation.</p>'}
  `;
});

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
