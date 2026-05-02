document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const tbody     = document.getElementById('cart-body');
  const totalEl   = document.getElementById('cart-total');
  const emptyMsg  = document.getElementById('empty-cart');
  const tableWrap = document.getElementById('table-wrap');
  if (!tbody) return;

  async function loadCart() {
    try {
      const data = await fetchAPI('/cart/get.php');
      if (!data.items.length) {
        tableWrap.style.display = 'none';
        emptyMsg.style.display  = 'block';
        return;
      }
      tableWrap.style.display = 'block';
      emptyMsg.style.display  = 'none';
      tbody.replaceChildren();

      data.items.forEach(item => {
        const tr = document.createElement('tr');

        const tdImg = document.createElement('td');
        const img = document.createElement('img');
        img.src = item.image || 'https://placehold.co/60x60?text=P';
        img.alt = item.name;
        img.className = 'cart-img';
        img.onerror = () => { img.src = 'https://placehold.co/60x60?text=P'; };
        tdImg.appendChild(img);

        const tdName = document.createElement('td');
        const link = document.createElement('a');
        link.href = `/product-detail.html?id=${item.product_id}`;
        link.textContent = item.name;
        tdName.appendChild(link);

        const tdPrice = document.createElement('td');
        tdPrice.textContent = `$${parseFloat(item.price).toFixed(2)}`;

        const tdQty = document.createElement('td');
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.min = '1';
        qtyInput.max = String(item.stock);
        qtyInput.value = String(item.quantity);
        qtyInput.className = 'qty-input';
        qtyInput.addEventListener('change', () => updateQty(item.id, parseInt(qtyInput.value)));
        tdQty.appendChild(qtyInput);

        const tdSub = document.createElement('td');
        tdSub.textContent = `$${(item.price * item.quantity).toFixed(2)}`;

        const tdRm = document.createElement('td');
        const rmBtn = document.createElement('button');
        rmBtn.className = 'btn btn-danger btn-sm';
        rmBtn.textContent = 'Remove';
        rmBtn.addEventListener('click', () => removeItem(item.id));
        tdRm.appendChild(rmBtn);

        tr.append(tdImg, tdName, tdPrice, tdQty, tdSub, tdRm);
        tbody.appendChild(tr);
      });

      if (totalEl) totalEl.textContent = `Total: $${data.total.toFixed(2)}`;
    } catch (err) {
      alert('Failed to load cart: ' + err.message);
    }
  }

  async function updateQty(cartId, quantity) {
    if (quantity < 1) return;
    try {
      await fetchAPI('/cart/update.php', {
        method: 'POST',
        body: JSON.stringify({ cart_id: cartId, quantity }),
      });
      loadCart();
      loadCartCount();
    } catch (err) { alert(err.message); }
  }

  async function removeItem(cartId) {
    try {
      await fetchAPI(`/cart/remove.php?id=${cartId}`, { method: 'DELETE' });
      loadCart();
      loadCartCount();
    } catch (err) { alert(err.message); }
  }

  loadCart();
});
