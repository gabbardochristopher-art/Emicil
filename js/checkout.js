// =========================================================
//  CHECKOUT PAGE
// =========================================================

let shippingCost = 4.99;

function renderSummary() {
  const items    = Cart.getItems();
  const itemsEl  = document.getElementById('checkout-items');
  const subEl    = document.getElementById('checkout-subtotal');
  const shipEl   = document.getElementById('checkout-shipping');
  const totalEl  = document.getElementById('checkout-total');

  itemsEl.innerHTML = items.map(item => `
    <div class="checkout-item">
      ${item.image ? `<img src="${item.image}" alt="${item.name}" />` : '<div style="width:56px;height:56px;background:#eee;border-radius:4px"></div>'}
      <div class="checkout-item__info">
        <p class="checkout-item__name">${item.name}</p>
        <p class="checkout-item__variant">${item.qty}x ${[item.variant?.size, item.variant?.color].filter(Boolean).join(' — ')}</p>
      </div>
      <span class="checkout-item__price">${formatPrice(item.price * item.qty)}</span>
    </div>`).join('') || '<p style="color:#aaa;font-size:.9rem">Panier vide</p>';

  const sub = Cart.getSubtotal();
  subEl.textContent  = formatPrice(sub);
  shipEl.textContent = formatPrice(shippingCost);
  totalEl.textContent = formatPrice(sub + shippingCost);
}

// Shipping method change
document.querySelectorAll('input[name="shipping-method"]').forEach(radio => {
  radio.addEventListener('change', () => {
    shippingCost = radio.value === 'express' ? 9.99 : 4.99;
    renderSummary();
  });
});

// Steps
function goTo(stepId) {
  document.querySelectorAll('.checkout-step').forEach(s => s.classList.add('hidden'));
  document.getElementById(stepId).classList.remove('hidden');

  const steps = ['step-shipping', 'step-payment', 'step-confirmation'];
  const idx   = steps.indexOf(stepId);
  document.querySelectorAll('.checkout-steps .step').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });
}

document.getElementById('shipping-form')?.addEventListener('submit', e => {
  e.preventDefault();
  if (!e.target.checkValidity()) { e.target.reportValidity(); return; }
  goTo('step-payment');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('back-to-shipping')?.addEventListener('click', () => goTo('step-shipping'));

// Card number formatting
document.getElementById('card-number')?.addEventListener('input', e => {
  e.target.value = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
});
document.getElementById('card-expiry')?.addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
  e.target.value = v.slice(0, 5);
});

document.getElementById('payment-form')?.addEventListener('submit', e => {
  e.preventDefault();
  if (!e.target.checkValidity()) { e.target.reportValidity(); return; }

  const orderId = 'EM-' + Date.now().toString(36).toUpperCase();
  document.getElementById('order-number').textContent = orderId;
  Cart.clear();
  goTo('step-confirmation');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

renderSummary();
