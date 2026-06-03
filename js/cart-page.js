// =========================================================
//  CART PAGE
// =========================================================

let discount = 0;

function renderCart() {
  const items       = Cart.getItems();
  const cartItemsEl = document.getElementById('cart-items');
  const cartEmptyEl = document.getElementById('cart-empty');
  const summaryEl   = document.getElementById('cart-summary');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (!items.length) {
    cartItemsEl.innerHTML = '';
    cartEmptyEl.classList.remove('hidden');
    summaryEl.style.opacity = '.5';
    checkoutBtn.setAttribute('disabled', true);
    document.getElementById('subtotal').textContent = formatPrice(0);
    document.getElementById('total').textContent    = formatPrice(0);
    return;
  }

  cartEmptyEl.classList.add('hidden');
  summaryEl.style.opacity = '1';
  checkoutBtn.removeAttribute('disabled');

  cartItemsEl.innerHTML = items.map(item => `
    <div class="cart-item" data-key="${item.key}">
      <div class="cart-item__image">
        ${item.image
          ? `<img src="${item.image}" alt="${item.name}" />`
          : `<div style="width:100%;height:100%;background:#eee;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:.75rem">Image</div>`}
      </div>
      <div class="cart-item__info">
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__variant">${[item.variant?.size, item.variant?.color].filter(Boolean).join(' — ') || ''}</p>
        <div class="cart-item__qty">
          <button onclick="changeQty('${item.key}', ${item.qty - 1})">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty('${item.key}', ${item.qty + 1})">+</button>
        </div>
      </div>
      <div class="cart-item__right">
        <p class="cart-item__price">${formatPrice(item.price * item.qty)}</p>
        <button class="cart-item__remove" onclick="removeFromCart('${item.key}')">Retirer</button>
      </div>
    </div>`).join('');

  const subtotal = Cart.getSubtotal();
  const total    = Math.max(0, subtotal - discount);
  document.getElementById('subtotal').textContent = formatPrice(subtotal);
  document.getElementById('total').textContent    = formatPrice(total);
}

function changeQty(key, qty) {
  Cart.updateQty(key, qty);
  renderCart();
}
function removeFromCart(key) {
  Cart.removeItem(key);
  renderCart();
}

// Promo
document.getElementById('apply-promo')?.addEventListener('click', () => {
  const code = document.getElementById('promo-input').value.trim();
  const pct  = Cart.applyPromo(code);
  if (pct) {
    discount = Cart.getSubtotal() * pct / 100;
    showToast(`Code "${code}" appliqué : -${pct}%`);
  } else {
    showToast('Code promo invalide', 'error');
    discount = 0;
  }
  renderCart();
});

document.addEventListener('cart:updated', renderCart);
renderCart();
