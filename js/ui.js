// =========================================================
//  UI — composants partagés
// =========================================================

// ---- Année footer ----
document.querySelectorAll('#year').forEach(el => { el.textContent = new Date().getFullYear(); });

// ---- Menu mobile ----
const menuToggle = document.getElementById('menu-toggle');
const mainNav    = document.querySelector('.main-nav');
if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    menuToggle.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', open);
  });
}

// ---- Compteur panier ----
function updateCartCount() {
  document.querySelectorAll('#cart-count').forEach(el => {
    const count = Cart.getTotalQty();
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}
document.addEventListener('cart:updated', updateCartCount);
updateCartCount();

// ---- Toast ----
function showToast(message, type = 'success', duration = 3000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ---- Product card builder ----
function buildProductCard(product, pathPrefix = '') {
  const badge = product.badge
    ? `<span class="product-card__badge badge-${product.badge}">${product.badge === 'new' ? 'Nouveau' : 'Soldes'}</span>`
    : '';
  const oldPrice = product.oldPrice
    ? `<span class="price-old">${formatPrice(product.oldPrice)}</span>`
    : '';
  const img = product.image
    ? `<img src="${product.image}" alt="${product.name}" loading="lazy" />`
    : `<div style="width:100%;height:100%;background:#eee;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:.8rem;">Image</div>`;

  return `
    <article class="product-card">
      <div class="product-card__image">
        <a href="${pathPrefix}pages/product.html?id=${product.id}">${img}</a>
        ${badge}
        <div class="product-card__actions">
          <button class="btn-icon" onclick="quickAddToCart(${product.id})" aria-label="Ajouter au panier">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
        </div>
      </div>
      <div class="product-card__body">
        <p class="product-card__category">${getCategoryById(product.category)?.name || ''}</p>
        <h3 class="product-card__name">
          <a href="${pathPrefix}pages/product.html?id=${product.id}">${product.name}</a>
        </h3>
        <div class="product-card__price">
          <span class="price-current">${formatPrice(product.price)}</span>
          ${oldPrice}
        </div>
        <button class="btn btn-outline product-card__add" onclick="quickAddToCart(${product.id})">Ajouter au panier</button>
      </div>
    </article>`;
}

function quickAddToCart(productId) {
  const product = getProductById(productId);
  if (!product) return;
  Cart.addItem(product, 1);
  showToast(`"${product.name}" ajouté au panier`);
}

function formatPrice(price) {
  return price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

// ---- Newsletter ----
document.querySelectorAll('.newsletter-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    showToast('Inscription confirmée !');
    form.reset();
  });
});
