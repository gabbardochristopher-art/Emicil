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
const TITLES = { notifications: 'Notifications', overview: 'Tableau de bord', clients: 'Clients', products: 'Produits', orders: 'Commandes', formations: 'Formations', reviews: 'Avis', galerie: 'Galerie', popup: 'Pop-up', settings: 'Paramètres' };

function showSection(name) {
  navLinks.forEach(l  => l.classList.toggle('active', l.dataset.section === name));
  sections.forEach(s  => s.classList.toggle('hidden', s.id !== `section-${name}`));
  pageTitle.textContent = TITLES[name] || name;
  if (name === 'overview')   loadStats();
  if (name === 'clients')    loadClients();
  if (name === 'products')   loadProducts();
  if (name === 'orders')     loadOrders();
  if (name === 'formations') loadFormations();
  if (name === 'reviews')       loadReviews();
  if (name === 'galerie')       loadGalerie();
  if (name === 'popup')         loadPopupSubmissions();
  if (name === 'notifications') renderNotifications();
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
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#7b7f93;padding:28px">Aucun client inscrit.</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(u => `
    <tr>
      <td><strong>${esc(u.firstName) || '—'} ${esc(u.lastName)}</strong></td>
      <td>${esc(u.email)}</td>
      <td>${esc(u.phone) || '—'}</td>
      <td style="color:#b08d57;font-weight:600">${u.points} pts</td>
      <td>
        ${u.banned
          ? '<span class="badge badge-non" style="background:rgba(239,68,68,.15);color:#fca5a5">Bloqué</span>'
          : u.confirmed
            ? '<span class="badge badge-oui">Actif</span>'
            : '<span class="badge badge-non">Non confirmé</span>'}
      </td>
      <td style="color:#7b7f93">${new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
      <td style="white-space:nowrap">
        <button class="btn-action btn-edit" data-user-id="${esc(u.id)}" data-user-email="${esc(u.email)}" data-user-name="${esc(u.firstName)}">Activité</button>
        <button class="btn-action ${u.banned ? 'btn-edit' : 'btn-delete'}" data-client-ban="${esc(u.id)}" data-banned="${u.banned ? '1' : '0'}" data-client-name="${esc(u.firstName || u.email)}">${u.banned ? 'Débloquer' : 'Bloquer'}</button>
        <button class="btn-action btn-delete" data-client-delete="${esc(u.id)}" data-client-name="${esc(u.firstName || u.email)}">Supprimer</button>
      </td>
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

// Bloquer / Débloquer un client
document.getElementById('clients-tbody')?.addEventListener('click', async e => {
  const banBtn = e.target.closest('[data-client-ban]');
  if (banBtn) {
    const userId  = banBtn.dataset.clientBan;
    const name    = banBtn.dataset.clientName;
    const isBanned = banBtn.dataset.banned === '1';
    const action  = isBanned ? 'Débloquer' : 'Bloquer';
    if (!confirm(`${action} le client ${name} ?`)) return;
    const res = await fetch(`${API}/admin/users-ban/${userId}`, {
      method: 'PUT', headers: headers(), body: JSON.stringify({ ban: !isBanned })
    });
    if (res.ok) loadClients();
    else alert('Erreur lors du traitement.');
    return;
  }

  const delBtn = e.target.closest('[data-client-delete]');
  if (delBtn) {
    const userId = delBtn.dataset.clientDelete;
    const name   = delBtn.dataset.clientName;
    if (!confirm(`Supprimer définitivement le compte de ${name} ?\nCette action est irréversible.`)) return;
    const res = await fetch(`${API}/admin/users-delete/${userId}`, {
      method: 'DELETE', headers: headers()
    });
    if (res.ok) loadClients();
    else alert('Erreur lors de la suppression.');
  }
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
      <td>
        ${MODE[o.shipping_mode] || esc(o.shipping_mode)}
        ${o.shipping_mode === 'domicile' && o.shipping_address ? `
          <div style="font-size:.72rem;color:#7b7f93;margin-top:4px;line-height:1.4">
            ${esc(o.shipping_address.adresse)}<br>${esc(o.shipping_address.codePostal)} ${esc(o.shipping_address.ville)}
          </div>` : ''}
      </td>
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
  document.getElementById('f-dates').value        = (f.dates || []).join('\n');
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
  const datesRaw  = document.getElementById('f-dates').value.trim();
  const dates     = datesRaw ? datesRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];

  const body = {
    titre:       document.getElementById('f-titre').value.trim(),
    duree:       document.getElementById('f-duree').value.trim(),
    niveau:      document.getElementById('f-niveau').value,
    prix:        parseFloat(document.getElementById('f-prix').value),
    places_max:  parseInt(document.getElementById('f-places').value) || 4,
    description: document.getElementById('f-description').value.trim(),
    points,
    dates,
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
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:#7b7f93;padding:28px">Aucune réservation.</td></tr>`;
    return;
  }
  const STATUS = { pending: '⏳ En attente', confirmed: '✓ Confirmée', cancelled: '✗ Annulée' };

  // Calcul places restantes par formation + date
  const placesMap = {};
  allBookings.filter(b => b.status !== 'cancelled').forEach(b => {
    if (!b.date_choisie) return;
    const key = `${b.formation_id}_${b.date_choisie}`;
    placesMap[key] = (placesMap[key] || 0) + 1;
  });
  function getRemaining(b) {
    if (!b.date_choisie) return null;
    const formation = allFormations.find(f => f.id === b.formation_id);
    const max  = formation?.places_max || 4;
    const key  = `${b.formation_id}_${b.date_choisie}`;
    return Math.max(0, max - (placesMap[key] || 0));
  }

  tbody.innerHTML = list.map(b => {
    const remaining = getRemaining(b);
    return `
    <tr>
      <td><strong>${esc(b.formations?.titre) || '—'}</strong></td>
      <td>${esc(b.user_name) || '—'}</td>
      <td>${esc(b.user_email)}</td>
      <td>${esc(b.user_phone) || '—'}</td>
      <td>
        <span style="color:#b08d57;font-weight:500">${esc(b.date_choisie) || '—'}</span>
        ${remaining !== null ? `<div style="font-size:.72rem;color:${remaining === 0 ? '#ef4444' : '#7b7f93'};margin-top:2px">${remaining === 0 ? 'Complet' : remaining + ' place' + (remaining > 1 ? 's' : '') + ' restante' + (remaining > 1 ? 's' : '')}</div>` : ''}
      </td>
      <td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#7b7f93">${esc(b.message) || '—'}</td>
      <td><span class="badge badge-${b.status === 'pending' ? 'new' : b.status === 'confirmed' ? 'oui' : 'non'}">${STATUS[b.status] || esc(b.status)}</span></td>
      <td style="color:#7b7f93">${new Date(b.created_at).toLocaleDateString('fr-FR')}</td>
      <td>
        ${b.status === 'pending' ? `
          <button class="btn-action btn-edit"   data-id="${b.id}" data-booking-action="confirmed">Confirmer</button>
          <button class="btn-action btn-delete" data-id="${b.id}" data-booking-action="cancelled">Annuler</button>
        ` : ''}
        <button class="btn-action btn-delete" data-id="${b.id}" data-booking-delete="1" style="margin-top:${b.status === 'pending' ? '4px' : '0'}">Supprimer</button>
      </td>
    </tr>`;
  }).join('');
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

async function deleteBooking(id) {
  if (!confirm('Supprimer définitivement cette réservation ?')) return;
  const res = await fetch(`${API}/admin/formation-bookings/${id}`, {
    method: 'DELETE', headers: headers()
  });
  if (res.ok) loadBookings();
  else alert('Erreur lors de la suppression.');
}

document.getElementById('bookings-tbody')?.addEventListener('click', e => {
  const delBtn = e.target.closest('[data-booking-delete]');
  if (delBtn) { deleteBooking(delBtn.dataset.id); return; }
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
//  AVIS PRODUITS (modération)
// =========================================================
let allReviews   = [];
let reviewFilter = 'pending';

function renderStars(rating) {
  return [1,2,3,4,5].map(i =>
    `<span style="color:${i <= rating ? '#b08d57' : '#ddcdb2'}">★</span>`
  ).join('');
}

async function loadReviews() {
  const tbody = document.getElementById('reviews-tbody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#7b7f93;padding:28px">Chargement…</td></tr>';
  const res = await fetch(`${API}/admin/reviews`, { headers: headers() });
  if (!res.ok) { tbody.innerHTML = '<tr><td colspan="7" style="color:red;padding:16px">Erreur.</td></tr>'; return; }
  allReviews = await res.json();

  const pending = allReviews.filter(r => r.status === 'pending').length;
  const badge   = document.getElementById('reviews-badge');
  if (pending > 0) { badge.textContent = pending; badge.style.display = 'inline'; }
  else badge.style.display = 'none';

  renderReviews();
}

function renderReviews() {
  const tbody = document.getElementById('reviews-tbody');
  const list  = reviewFilter === 'all' ? allReviews : allReviews.filter(r => r.status === reviewFilter);
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#7b7f93;padding:28px">Aucun avis.</td></tr>`;
    return;
  }
  const STATUS = { pending: '⏳ En attente', approved: '✓ Publié', rejected: '✗ Refusé' };
  tbody.innerHTML = list.map(r => `
    <tr>
      <td><strong>${esc(r.products?.name) || '—'}</strong></td>
      <td>${esc(r.user_name) || '—'}</td>
      <td style="white-space:nowrap">${renderStars(r.rating)}</td>
      <td style="max-width:280px;color:#7b7f93">${esc(r.comment)}</td>
      <td style="color:#7b7f93">${new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
      <td><span class="badge badge-${r.status === 'pending' ? 'new' : r.status === 'approved' ? 'oui' : 'non'}">${STATUS[r.status] || esc(r.status)}</span></td>
      <td>
        ${r.status === 'pending' ? `
          <button class="btn-action btn-edit"   data-id="${r.id}" data-review-action="approved">Publier</button>
          <button class="btn-action btn-delete" data-id="${r.id}" data-review-action="rejected">Refuser</button>
        ` : '—'}
      </td>
    </tr>`).join('');
}

async function updateReview(id, status) {
  const label = status === 'approved' ? 'Publier' : 'Refuser';
  if (!confirm(`${label} cet avis ?`)) return;
  const res = await fetch(`${API}/admin/reviews/${id}`, {
    method: 'PUT', headers: headers(), body: JSON.stringify({ status })
  });
  if (res.ok) loadReviews();
  else alert('Erreur lors du traitement.');
}

document.getElementById('reviews-tbody')?.addEventListener('click', e => {
  const btn = e.target.closest('[data-review-action]');
  if (btn) updateReview(btn.dataset.id, btn.dataset.reviewAction);
});

document.querySelectorAll('.review-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.review-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    reviewFilter = btn.dataset.filter;
    renderReviews();
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
          <td>
            ${MODE[o.shipping_mode] || esc(o.shipping_mode)}
            ${o.shipping_mode === 'domicile' && o.shipping_address ? `
              <div style="font-size:.72rem;color:#7b7f93;margin-top:4px;line-height:1.4">
                ${esc(o.shipping_address.adresse)}<br>${esc(o.shipping_address.codePostal)} ${esc(o.shipping_address.ville)}
              </div>` : ''}
          </td>
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
//  GALERIE PHOTOS
// =========================================================
let allGaleriePhotos = [];

async function loadGalerie() {
  const grid = document.getElementById('galerie-grid');
  grid.innerHTML = '<p style="color:#7b7f93;text-align:center;padding:28px;grid-column:1/-1">Chargement…</p>';
  const res = await fetch(`${API}/admin/galerie`, { headers: headers() });
  if (!res.ok) { grid.innerHTML = '<p style="color:red;padding:16px">Erreur.</p>'; return; }
  allGaleriePhotos = await res.json();
  document.getElementById('galerie-count').textContent = `${allGaleriePhotos.length} photo(s)`;
  renderGalerie();
}

function renderGalerie() {
  const grid = document.getElementById('galerie-grid');
  if (!allGaleriePhotos.length) {
    grid.innerHTML = '<p style="color:#7b7f93;text-align:center;padding:28px;grid-column:1/-1">Aucune photo. Ajoutez-en une !</p>';
    return;
  }
  grid.innerHTML = allGaleriePhotos.map(p => `
    <div style="position:relative;border-radius:10px;overflow:hidden;border:1px solid var(--a-border);background:var(--a-surface);">
      ${p.type === 'video'
        ? `<video src="${esc(p.url)}" style="width:100%;height:160px;object-fit:cover;display:block;" muted></video>
           <div style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,.6);color:#fff;font-size:.65rem;padding:2px 8px;border-radius:4px;">▶ Vidéo</div>`
        : `<img src="${esc(p.url)}" style="width:100%;height:160px;object-fit:cover;display:block;" />`}
      <div style="padding:10px 12px;">
        <div style="font-size:.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.legende) || '<span style="color:var(--a-muted)">Sans légende</span>'}</div>
        <div style="font-size:.72rem;color:var(--a-muted);margin-top:4px">${esc(p.categorie) || 'Sans catégorie'} · Pos. ${p.position} · ${p.visible ? '✓ Visible' : '✗ Masquée'}</div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn-action btn-edit" data-galerie-edit="${p.id}">Modifier</button>
          <button class="btn-action btn-delete" data-galerie-delete="${p.id}">Supprimer</button>
        </div>
      </div>
    </div>`).join('');
}

// Modal galerie
const galerieModal      = document.getElementById('galerie-modal');
const galerieForm       = document.getElementById('galerie-form');
const galerieModalError = document.getElementById('galerie-modal-error');

const SUPABASE_URL = window.SUPABASE?.supabaseUrl || 'https://mspqucufnwgvjytwsnfp.supabase.co';

function openGalerieModal(title) {
  document.getElementById('galerie-modal-title').textContent = title;
  galerieModalError.classList.add('hidden');
  galerieModal.classList.remove('hidden');
}
function closeGalerieModal() {
  galerieModal.classList.add('hidden');
  galerieForm.reset();
  document.getElementById('g-preview').style.display = 'none';
  document.getElementById('g-preview-img').style.display = 'block';
  document.getElementById('g-preview-video').style.display = 'none';
  document.getElementById('g-type').value = 'image';
  document.getElementById('g-file-group').style.display = '';
}

document.getElementById('galerie-modal-close')?.addEventListener('click', closeGalerieModal);
document.getElementById('galerie-modal-cancel')?.addEventListener('click', closeGalerieModal);
galerieModal?.addEventListener('click', e => { if (e.target === galerieModal) closeGalerieModal(); });

document.getElementById('g-file')?.addEventListener('change', e => {
  const file = e.target.files[0];
  const preview  = document.getElementById('g-preview');
  const img      = document.getElementById('g-preview-img');
  const video    = document.getElementById('g-preview-video');
  if (!file) { preview.style.display = 'none'; return; }
  const isVideo = file.type.startsWith('video/');
  document.getElementById('g-type').value = isVideo ? 'video' : 'image';
  if (isVideo) {
    img.style.display = 'none'; video.style.display = 'block';
    video.src = URL.createObjectURL(file);
  } else {
    video.style.display = 'none'; img.style.display = 'block';
    const reader = new FileReader();
    reader.onload = ev => { img.src = ev.target.result; };
    reader.readAsDataURL(file);
  }
  preview.style.display = 'block';
});

async function uploadToSupabase(file) {
  const ext  = file.name.split('.').pop().toLowerCase();
  const name = `photo_${Date.now()}.${ext}`;
  const { data, error } = await window.SUPABASE.storage.from('galerie').upload(name, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data: urlData } = window.SUPABASE.storage.from('galerie').getPublicUrl(name);
  return urlData.publicUrl;
}

document.getElementById('btn-add-photo')?.addEventListener('click', () => {
  document.getElementById('g-id').value = '';
  document.getElementById('g-url').value = '';
  document.getElementById('g-visible').checked = true;
  document.getElementById('g-position').value = allGaleriePhotos.length;
  document.getElementById('g-file-group').style.display = '';
  document.getElementById('g-preview').style.display = 'none';
  openGalerieModal('Ajouter une photo');
});

function openGalerieEdit(id) {
  const p = allGaleriePhotos.find(p => p.id === id);
  if (!p) return;
  document.getElementById('g-id').value         = p.id;
  document.getElementById('g-url').value        = p.url || '';
  document.getElementById('g-type').value       = p.type || 'image';
  document.getElementById('g-categorie').value  = p.categorie || '';
  document.getElementById('g-legende').value    = p.legende || '';
  document.getElementById('g-position').value   = p.position || 0;
  document.getElementById('g-visible').checked  = !!p.visible;
  document.getElementById('g-file-group').style.display = 'none';
  if (p.url) {
    if (p.type === 'video') {
      document.getElementById('g-preview-img').style.display = 'none';
      document.getElementById('g-preview-video').style.display = 'block';
      document.getElementById('g-preview-video').src = p.url;
    } else {
      document.getElementById('g-preview-video').style.display = 'none';
      document.getElementById('g-preview-img').style.display = 'block';
      document.getElementById('g-preview-img').src = p.url;
    }
    document.getElementById('g-preview').style.display = 'block';
  }
  openGalerieModal(p.type === 'video' ? 'Modifier la vidéo' : 'Modifier la photo');
}

galerieForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const id  = document.getElementById('g-id').value;
  const btn = document.getElementById('galerie-modal-submit');
  btn.textContent = 'Enregistrement…'; btn.disabled = true;
  galerieModalError.classList.add('hidden');

  try {
    let imageUrl = document.getElementById('g-url').value.trim();
    const file   = document.getElementById('g-file').files[0];

    if (!id && !file) {
      galerieModalError.textContent = 'Veuillez sélectionner une image.';
      galerieModalError.classList.remove('hidden');
      btn.textContent = 'Enregistrer'; btn.disabled = false;
      return;
    }

    if (file) {
      btn.textContent = 'Upload en cours…';
      imageUrl = await uploadToSupabase(file);
    }

    const mediaType = file ? (file.type.startsWith('video/') ? 'video' : 'image') : document.getElementById('g-type').value || 'image';
    const body = {
      url:       imageUrl,
      type:      mediaType,
      categorie: document.getElementById('g-categorie').value,
      legende:   document.getElementById('g-legende').value.trim(),
      position:  parseInt(document.getElementById('g-position').value) || 0,
      visible:   document.getElementById('g-visible').checked,
    };

    const url    = id ? `${API}/admin/galerie/${id}` : `${API}/admin/galerie`;
    const method = id ? 'PUT' : 'POST';
    const res    = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) });
    const data   = await res.json();

    if (!res.ok) throw new Error(data.error || 'Erreur');
    closeGalerieModal();
    loadGalerie();
  } catch (err) {
    galerieModalError.textContent = err.message;
    galerieModalError.classList.remove('hidden');
  }
  btn.textContent = 'Enregistrer'; btn.disabled = false;
});

async function deleteGaleriePhoto(id) {
  if (!confirm('Supprimer cette photo ?')) return;
  const res = await fetch(`${API}/admin/galerie/${id}`, { method: 'DELETE', headers: headers() });
  if (res.ok) loadGalerie();
  else alert('Erreur lors de la suppression.');
}

document.getElementById('galerie-grid')?.addEventListener('click', e => {
  const editBtn = e.target.closest('[data-galerie-edit]');
  if (editBtn) { openGalerieEdit(parseInt(editBtn.dataset.galerieEdit)); return; }
  const delBtn = e.target.closest('[data-galerie-delete]');
  if (delBtn) deleteGaleriePhoto(parseInt(delBtn.dataset.galerieDelete));
});

// =========================================================
//  POPUP SUBMISSIONS
// =========================================================
let allPopupSubmissions = [];

async function loadPopupSubmissions() {
  const tbody = document.getElementById('popup-tbody');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#7b7f93;padding:28px">Chargement…</td></tr>';
  const res = await fetch(`${API}/admin/popup-submissions`, { headers: headers() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    tbody.innerHTML = `<tr><td colspan="8" style="color:red;padding:16px">Erreur ${res.status} : ${err.error || res.statusText}</td></tr>`;
    return;
  }
  allPopupSubmissions = await res.json();
  document.getElementById('popup-count').textContent = `${allPopupSubmissions.length} réponse(s)`;
  updatePopupBadge();
  renderPopupSubmissions(allPopupSubmissions);
}

function getSeenPopups() {
  try { return JSON.parse(localStorage.getItem('popup_seen') || '[]'); } catch { return []; }
}
function markPopupSeen(id) {
  const seen = getSeenPopups();
  if (!seen.includes(id)) { seen.push(id); localStorage.setItem('popup_seen', JSON.stringify(seen)); }
}

function updatePopupBadge() {
  const seen    = getSeenPopups();
  const unseen  = allPopupSubmissions.filter(s => !seen.includes(s.id)).length;
  const badge   = document.getElementById('popup-badge');
  if (unseen > 0) { badge.textContent = unseen; badge.style.display = 'inline'; }
  else badge.style.display = 'none';
}

function renderPopupSubmissions(list) {
  const tbody = document.getElementById('popup-tbody');
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#7b7f93;padding:28px">Aucune réponse au quiz.</td></tr>';
    return;
  }
  const seen = getSeenPopups();
  tbody.innerHTML = list.map(s => {
    const isNew = !seen.includes(s.id);
    return `
    <tr style="cursor:pointer;${isNew ? 'background:rgba(108,99,255,.06)' : ''}" data-popup-id="${s.id}">
      <td><strong>${esc(s.prenom)}</strong> ${isNew ? '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef4444;margin-left:6px"></span>' : ''}</td>
      <td>${esc(s.nom)}</td>
      <td>${esc(s.email)}</td>
      <td>${esc(s.telephone) || '—'}</td>
      <td><span class="badge badge-new">${esc(s.style) || '—'}</span></td>
      <td style="color:#7b7f93;font-size:.82rem">${esc(s.experience) || '—'}</td>
      <td style="color:#7b7f93;font-size:.82rem">${esc(s.objectif) || '—'}</td>
      <td style="color:#7b7f93">${new Date(s.created_at).toLocaleDateString('fr-FR')}</td>
    </tr>`;
  }).join('');
}

document.getElementById('popup-tbody')?.addEventListener('click', e => {
  const row = e.target.closest('[data-popup-id]');
  if (!row) return;
  const id = parseInt(row.dataset.popupId);
  markPopupSeen(id);
  row.style.background = '';
  const dot = row.querySelector('span[style*="border-radius:50%"]');
  if (dot) dot.remove();
  updatePopupBadge();
});

document.getElementById('search-popup')?.addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  renderPopupSubmissions(allPopupSubmissions.filter(s =>
    (s.prenom + ' ' + s.nom).toLowerCase().includes(q) ||
    s.email.toLowerCase().includes(q) ||
    (s.telephone || '').includes(q) ||
    (s.style || '').toLowerCase().includes(q)
  ));
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

// =========================================================
//  CENTRE DE NOTIFICATIONS
// =========================================================
let notifications = [];

function getSeenNotifs() {
  try { return JSON.parse(localStorage.getItem('admin_notifs_seen') || '[]'); } catch { return []; }
}
function markNotifSeen(id) {
  const seen = getSeenNotifs();
  if (!seen.includes(id)) { seen.push(id); localStorage.setItem('admin_notifs_seen', JSON.stringify(seen)); }
}

function addNotification(type, label, section, refId) {
  const id = `${type}_${refId}`;
  if (notifications.find(n => n.id === id)) return;
  notifications.unshift({ id, type, label, section, time: new Date() });
  updateNotifBadge();
  const currentSection = document.querySelector('.nav-link.active')?.dataset.section;
  if (currentSection === 'notifications') renderNotifications();
}

function updateNotifBadge() {
  const seen   = getSeenNotifs();
  const unseen = notifications.filter(n => !seen.includes(n.id)).length;
  const badge  = document.getElementById('notif-badge');
  if (unseen > 0) { badge.textContent = unseen; badge.style.display = 'inline'; }
  else badge.style.display = 'none';
}

function renderNotifications() {
  const container = document.getElementById('notif-list');
  const seen = getSeenNotifs();
  if (!notifications.length) {
    container.innerHTML = '<p style="color:#7b7f93;text-align:center;padding:28px">Aucune notification.</p>';
    return;
  }
  container.innerHTML = notifications.map(n => {
    const isNew = !seen.includes(n.id);
    const ICONS = { order: '🛒', booking: '📚', review: '⭐', popup: '💬' };
    const time  = n.time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const date  = n.time.toLocaleDateString('fr-FR');
    return `
      <div data-notif-id="${esc(n.id)}" data-notif-section="${esc(n.section)}" style="
        display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:10px;cursor:pointer;
        border:1px solid ${isNew ? 'rgba(108,99,255,.3)' : 'var(--a-border)'};
        background:${isNew ? 'rgba(108,99,255,.08)' : 'var(--a-surface)'};
        transition:all .15s;">
        <span style="font-size:1.3rem;flex-shrink:0">${ICONS[n.type] || '🔔'}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:.9rem;${isNew ? 'font-weight:600;color:var(--a-text)' : 'color:var(--a-muted)'}">${esc(n.label)}</div>
          <div style="font-size:.75rem;color:var(--a-muted);margin-top:2px">${date} à ${time}</div>
        </div>
        ${isNew ? '<span style="width:10px;height:10px;border-radius:50%;background:#ef4444;flex-shrink:0"></span>' : ''}
        <span style="font-size:.75rem;color:var(--a-primary)">Voir →</span>
      </div>`;
  }).join('');
}

document.getElementById('notif-list')?.addEventListener('click', e => {
  const card = e.target.closest('[data-notif-id]');
  if (!card) return;
  markNotifSeen(card.dataset.notifId);
  updateNotifBadge();
  showSection(card.dataset.notifSection);
});

// Realtime
if (window.SUPABASE) {
  window.SUPABASE
    .channel('admin-realtime-notifs')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
      const o = payload.new;
      addNotification('order', `Nouvelle commande ${o.id || ''}`, 'orders', o.id || Date.now());
      const cs = document.querySelector('.nav-link.active')?.dataset.section;
      if (cs === 'orders') loadOrders();
      if (cs === 'overview') loadStats();
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'formation_bookings' }, (payload) => {
      const b = payload.new;
      addNotification('booking', `Nouvelle réservation formation — ${b.user_name || b.user_email || ''}`, 'formations', b.id || Date.now());
      const cs = document.querySelector('.nav-link.active')?.dataset.section;
      if (cs === 'formations') loadBookings();
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews' }, (payload) => {
      const r = payload.new;
      addNotification('review', `Nouvel avis — ${r.user_name || ''}`, 'reviews', r.id || Date.now());
      const cs = document.querySelector('.nav-link.active')?.dataset.section;
      if (cs === 'reviews') loadReviews();
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'popup_submissions' }, (payload) => {
      const p = payload.new;
      addNotification('popup', `Nouveau prospect — ${p.prenom || ''} ${p.nom || ''}`, 'popup', p.id || Date.now());
      const cs = document.querySelector('.nav-link.active')?.dataset.section;
      if (cs === 'popup') loadPopupSubmissions();
    })
    .subscribe();
}

// Chargement initial des notifications existantes + polling
async function loadInitialNotifications() {
  try {
    const [ordRes, bookRes, revRes, popRes] = await Promise.all([
      fetch(`${API}/admin/orders`, { headers: headers() }),
      fetch(`${API}/admin/formation-bookings`, { headers: headers() }),
      fetch(`${API}/admin/reviews`, { headers: headers() }),
      fetch(`${API}/admin/popup-submissions`, { headers: headers() }),
    ]);
    const orders   = ordRes.ok  ? await ordRes.json()  : [];
    const bookings = bookRes.ok ? await bookRes.json() : [];
    const reviews  = revRes.ok  ? await revRes.json()  : [];
    const popups   = popRes.ok  ? await popRes.json()  : [];

    orders.filter(o => o.status === 'pending').forEach(o => {
      addNotification('order', `Commande en attente — ${esc(o.id)}`, 'orders', o.id);
    });
    bookings.filter(b => b.status === 'pending').forEach(b => {
      addNotification('booking', `Réservation formation — ${esc(b.user_name || b.user_email || '')}`, 'formations', b.id);
    });
    reviews.filter(r => r.status === 'pending').forEach(r => {
      addNotification('review', `Avis en attente — ${esc(r.user_name || '')}`, 'reviews', r.id);
    });
    const seenPopups = getSeenPopups();
    popups.filter(p => !seenPopups.includes(p.id)).forEach(p => {
      addNotification('popup', `Prospect — ${esc(p.prenom || '')} ${esc(p.nom || '')}`, 'popup', p.id);
    });
  } catch {}
}
loadInitialNotifications();

// Polling pour détecter les nouvelles entrées
let lastOrderCount = -1, lastBookingCount = -1, lastReviewCount = -1, lastPopupCount = -1;
async function pollNotifications() {
  try {
    const [ordRes, bookRes, revRes, popRes] = await Promise.all([
      fetch(`${API}/admin/orders`, { headers: headers() }),
      fetch(`${API}/admin/formation-bookings`, { headers: headers() }),
      fetch(`${API}/admin/reviews`, { headers: headers() }),
      fetch(`${API}/admin/popup-submissions`, { headers: headers() }),
    ]);
    const orders   = ordRes.ok  ? await ordRes.json()  : [];
    const bookings = bookRes.ok ? await bookRes.json() : [];
    const reviews  = revRes.ok  ? await revRes.json()  : [];
    const popups   = popRes.ok  ? await popRes.json()  : [];

    const po = orders.filter(o => o.status === 'pending').length;
    const pb = bookings.filter(b => b.status === 'pending').length;
    const pr = reviews.filter(r => r.status === 'pending').length;
    const pp = popups.length;

    if (lastOrderCount >= 0 && po > lastOrderCount)   addNotification('order', 'Nouvelle commande en attente', 'orders', 'poll_' + Date.now());
    if (lastBookingCount >= 0 && pb > lastBookingCount) addNotification('booking', 'Nouvelle réservation formation', 'formations', 'poll_' + Date.now());
    if (lastReviewCount >= 0 && pr > lastReviewCount)  addNotification('review', 'Nouvel avis en attente', 'reviews', 'poll_' + Date.now());
    if (lastPopupCount >= 0 && pp > lastPopupCount)    addNotification('popup', 'Nouveau prospect popup', 'popup', 'poll_' + Date.now());

    lastOrderCount = po; lastBookingCount = pb; lastReviewCount = pr; lastPopupCount = pp;
  } catch {}
}
setTimeout(pollNotifications, 35000);
setInterval(pollNotifications, 30000);

// Init
showSection('overview');
