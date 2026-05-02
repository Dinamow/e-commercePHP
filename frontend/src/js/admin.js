// ===== DASHBOARD =====
async function loadDashboard() {
  const statsGrid   = document.getElementById('stats-grid');
  const recentTable = document.getElementById('recent-orders-body');
  if (!statsGrid) return;

  try {
    const data = await fetchAPI('/admin/stats.php');
    const s = data.stats;

    const cards = [
      { label: 'Total Customers', value: s.total_customers },
      { label: 'Total Products',  value: s.total_products },
      { label: 'Total Orders',    value: s.total_orders },
      { label: 'Revenue',         value: `$${s.total_revenue.toFixed(2)}` },
    ];

    statsGrid.replaceChildren();
    cards.forEach(c => {
      const card = document.createElement('div');
      card.className = 'card stat-card';
      const body = document.createElement('div');
      body.className = 'card-body';

      const val = document.createElement('div');
      val.className = 'stat-value';
      val.textContent = c.value;

      const lbl = document.createElement('div');
      lbl.className = 'stat-label';
      lbl.textContent = c.label;

      body.append(val, lbl);
      card.appendChild(body);
      statsGrid.appendChild(card);
    });

    if (recentTable) {
      recentTable.replaceChildren();
      s.recent_orders.forEach(o => {
        const tr = document.createElement('tr');
        const cells = [
          `#${o.id}`, o.customer, `$${parseFloat(o.total).toFixed(2)}`,
          o.status, new Date(o.created_at).toLocaleDateString(),
        ];
        cells.forEach((text, i) => {
          const td = document.createElement('td');
          if (i === 3) {
            const badge = document.createElement('span');
            badge.className = `badge badge-${text}`;
            badge.textContent = text;
            td.appendChild(badge);
          } else {
            td.textContent = text;
          }
          tr.appendChild(td);
        });
        recentTable.appendChild(tr);
      });
    }
  } catch (err) {
    alert('Failed to load dashboard: ' + err.message);
  }
}

// ===== ADMIN PRODUCTS =====
async function loadAdminProducts() {
  const tbody = document.getElementById('products-body');
  if (!tbody) return;

  try {
    const data = await fetchAPI('/products/list.php');
    tbody.replaceChildren();
    data.products.forEach(p => {
      const tr = document.createElement('tr');
      const cells = [
        p.id, p.name, p.category,
        `$${parseFloat(p.price).toFixed(2)}`, p.stock,
      ];
      cells.forEach(text => {
        const td = document.createElement('td');
        td.textContent = text;
        tr.appendChild(td);
      });
      const tdActions = document.createElement('td');

      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-outline btn-sm';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => openEditModal(p));

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger btn-sm';
      delBtn.textContent = 'Delete';
      delBtn.style.marginLeft = '0.5rem';
      delBtn.addEventListener('click', () => deleteProduct(p.id, tr));

      tdActions.append(editBtn, delBtn);
      tr.appendChild(tdActions);
      tbody.appendChild(tr);
    });
  } catch (err) {
    alert('Failed to load products: ' + err.message);
  }
}

function openAddModal() {
  document.getElementById('modal-title').textContent = 'Add Product';
  document.getElementById('product-form').reset();
  document.getElementById('product-id').value = '';
  document.getElementById('product-modal').classList.add('open');
}

function openEditModal(p) {
  document.getElementById('modal-title').textContent = 'Edit Product';
  document.getElementById('product-id').value          = p.id;
  document.getElementById('product-name').value        = p.name;
  document.getElementById('product-desc').value        = p.description || '';
  document.getElementById('product-price').value       = p.price;
  document.getElementById('product-category').value    = p.category;
  document.getElementById('product-stock').value       = p.stock;
  document.getElementById('product-image').value       = p.image || '';
  document.getElementById('product-modal').classList.add('open');
}

function closeProductModal() {
  document.getElementById('product-modal').classList.remove('open');
}

async function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('product-id').value;
  const payload = {
    name:        document.getElementById('product-name').value.trim(),
    description: document.getElementById('product-desc').value.trim(),
    price:       parseFloat(document.getElementById('product-price').value),
    category:    document.getElementById('product-category').value.trim(),
    stock:       parseInt(document.getElementById('product-stock').value),
    image:       document.getElementById('product-image').value.trim(),
  };

  const endpoint = id
    ? '/products/update.php'
    : '/products/create.php';
  if (id) payload.id = parseInt(id);

  try {
    await fetchAPI(endpoint, { method: 'POST', body: JSON.stringify(payload) });
    closeProductModal();
    loadAdminProducts();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteProduct(id, row) {
  if (!confirm('Delete this product?')) return;
  try {
    await fetchAPI(`/products/delete.php?id=${id}`, { method: 'DELETE' });
    row.remove();
  } catch (err) { alert(err.message); }
}

// ===== ADMIN USERS =====
async function loadAdminUsers() {
  const tbody = document.getElementById('users-body');
  if (!tbody) return;
  try {
    const data = await fetchAPI('/admin/users.php');
    tbody.replaceChildren();
    data.users.forEach(u => {
      const tr = document.createElement('tr');
      [u.id, u.name, u.email, u.role, new Date(u.created_at).toLocaleDateString()].forEach(text => {
        const td = document.createElement('td');
        td.textContent = text;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  } catch (err) {
    alert('Failed to load users: ' + err.message);
  }
}

// ===== ADMIN ORDERS =====
async function loadAdminOrders() {
  const tbody = document.getElementById('orders-body');
  if (!tbody) return;
  try {
    const data = await fetchAPI('/admin/orders.php');
    tbody.replaceChildren();
    data.orders.forEach(o => {
      const tr = document.createElement('tr');
      [o.id, o.customer, o.email, `$${parseFloat(o.total).toFixed(2)}`,
       new Date(o.created_at).toLocaleDateString()].forEach(text => {
        const td = document.createElement('td');
        td.textContent = text;
        tr.appendChild(td);
      });

      const tdStatus = document.createElement('td');
      const select = document.createElement('select');
      ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        if (s === o.status) opt.selected = true;
        select.appendChild(opt);
      });
      select.addEventListener('change', async () => {
        try {
          await fetchAPI('/admin/orders.php', {
            method: 'POST',
            body: JSON.stringify({ order_id: o.id, status: select.value }),
          });
        } catch (err) { alert(err.message); }
      });
      tdStatus.appendChild(select);
      tr.appendChild(tdStatus);
      tbody.appendChild(tr);
    });
  } catch (err) {
    alert('Failed to load orders: ' + err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAdminAccess()) return;
  loadDashboard();
  loadAdminProducts();
  loadAdminUsers();
  loadAdminOrders();

  document.getElementById('product-form')?.addEventListener('submit', saveProduct);
  document.getElementById('add-product-btn')?.addEventListener('click', openAddModal);
  document.getElementById('close-modal-btn')?.addEventListener('click', closeProductModal);
});
