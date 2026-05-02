document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const summaryEl = document.getElementById('order-summary-items');
  const totalEl   = document.getElementById('order-total');
  const form      = document.getElementById('checkout-form');
  const successEl = document.getElementById('checkout-success');

  // Load order summary from cart
  try {
    const data = await fetchAPI('/cart/get.php');
    if (!data.items.length) {
      window.location.href = '/cart.html';
      return;
    }
    if (summaryEl) {
      summaryEl.replaceChildren();
      data.items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'summary-item';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = `${item.name} x${item.quantity}`;

        const priceSpan = document.createElement('span');
        priceSpan.textContent = `$${(item.price * item.quantity).toFixed(2)}`;

        div.append(nameSpan, priceSpan);
        summaryEl.appendChild(div);
      });
    }
    if (totalEl) {
      totalEl.textContent = `$${data.total.toFixed(2)}`;
    }
  } catch (err) {
    alert('Failed to load cart: ' + err.message);
    return;
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name    = document.getElementById('ship-name').value.trim();
    const address = document.getElementById('ship-address').value.trim();
    const city    = document.getElementById('ship-city').value.trim();
    const phone   = document.getElementById('ship-phone').value.trim();

    if (!name || !address || !city || !phone) {
      showAlert('alert-box', 'Please fill in all shipping fields');
      return;
    }

    const shippingAddress = `${name}, ${address}, ${city}, Phone: ${phone}`;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Placing order...';

    try {
      const data = await fetchAPI('/orders/create.php', {
        method: 'POST',
        body: JSON.stringify({ shipping_address: shippingAddress }),
      });

      form.style.display = 'none';
      if (successEl) {
        successEl.style.display = 'block';
        const orderIdEl = document.getElementById('success-order-id');
        if (orderIdEl) orderIdEl.textContent = `#${data.order_id}`;
      }
      loadCartCount();
    } catch (err) {
      showAlert('alert-box', err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order';
    }
  });
});
