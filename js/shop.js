// =========================================================
//  SHOP PAGE
// =========================================================

const ITEMS_PER_PAGE = 9;
let currentPage = 1;
let filtered = [...PRODUCTS];

// DOM refs
const grid         = document.getElementById('shop-products');
const countEl      = document.getElementById('results-count');
const paginationEl = document.getElementById('pagination');
const sortSelect   = document.getElementById('sort-select');
const priceSlider  = document.getElementById('price-max');
const priceLabel   = document.getElementById('price-max-label');
const resetBtn     = document.getElementById('reset-filters');
const catFilter    = document.getElementById('category-filter');
const viewBtns     = document.querySelectorAll('.view-btn');

// Build category filters
CATEGORIES.forEach(cat => {
  if (cat.id === 'all') return;
  catFilter.insertAdjacentHTML('beforeend', `
    <li><label><input type="radio" name="category" value="${cat.id}" /> ${cat.name}</label></li>`);
});

// Pre-select category from URL
const urlParams  = new URLSearchParams(window.location.search);
const urlCat     = urlParams.get('category');
if (urlCat) {
  const radio = catFilter.querySelector(`input[value="${urlCat}"]`);
  if (radio) radio.checked = true;
}

function applyFilters() {
  const activeCat  = catFilter.querySelector('input:checked')?.value || 'all';
  const maxPrice   = parseInt(priceSlider.value);
  const sort       = sortSelect.value;

  filtered = PRODUCTS
    .filter(p => activeCat === 'all' || p.category === activeCat)
    .filter(p => p.price <= maxPrice);

  if (sort === 'price-asc')  filtered.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  if (sort === 'name-asc')   filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'name-desc')  filtered.sort((a, b) => b.name.localeCompare(a.name));

  currentPage = 1;
  render();
}

function render() {
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const page  = filtered.slice(start, start + ITEMS_PER_PAGE);

  countEl.textContent = `${filtered.length} produit(s)`;
  grid.innerHTML = page.length
    ? page.map(p => buildProductCard(p, '../')).join('')
    : '<p style="color:#aaa;grid-column:1/-1;text-align:center;padding:40px 0">Aucun produit trouvé.</p>';

  renderPagination();
}

function renderPagination() {
  const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  paginationEl.innerHTML = '';
  if (total <= 1) return;

  for (let i = 1; i <= total; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.addEventListener('click', () => { currentPage = i; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    paginationEl.appendChild(btn);
  }
}

// Events
catFilter.addEventListener('change', applyFilters);
sortSelect.addEventListener('change', applyFilters);
priceSlider.addEventListener('input', () => {
  priceLabel.textContent = `${priceSlider.value} €`;
  applyFilters();
});
resetBtn.addEventListener('click', () => {
  catFilter.querySelector('input[value="all"]').checked = true;
  priceSlider.value = priceSlider.max;
  priceLabel.textContent = `${priceSlider.max} €`;
  sortSelect.value = 'default';
  applyFilters();
});
viewBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    viewBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    grid.classList.toggle('list-view', btn.dataset.view === 'list');
  });
});

applyFilters();
