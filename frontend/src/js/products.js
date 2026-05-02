document.addEventListener('DOMContentLoaded', async () => {
  const grid        = document.getElementById('products-grid');
  const searchInput = document.getElementById('search');
  const catSelect   = document.getElementById('category-filter');
  if (!grid) return;

  function setLoading(msg) {
    const p = document.createElement('p');
    p.className = 'loading';
    p.textContent = msg;
    grid.replaceChildren(p);
  }

  async function loadProducts() {
    const search   = searchInput?.value || '';
    const category = catSelect?.value || '';
    const params   = new URLSearchParams();
    if (search)   params.set('search', search);
    if (category) params.set('category', category);

    setLoading('Loading products...');
    try {
      const data = await fetchAPI('/products/list.php?' + params.toString());

      if (catSelect && catSelect.options.length <= 1) {
        data.categories.forEach(cat => {
          const opt = document.createElement('option');
          opt.value = cat;
          opt.textContent = cat;
          catSelect.appendChild(opt);
        });
      }

      if (!data.products.length) {
        setLoading('No products found.');
        return;
      }

      grid.replaceChildren();
      data.products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card product-card';

        const img = document.createElement('img');
        img.src = p.image || 'https://placehold.co/400x300?text=Product';
        img.alt = p.name;
        img.onerror = () => { img.src = 'https://placehold.co/400x300?text=Product'; };

        const body = document.createElement('div');
        body.className = 'card-body';

        const name = document.createElement('a');
        name.href = `/product-detail.html?id=${p.id}`;
        name.className = 'name';
        name.textContent = p.name;

        const cat = document.createElement('div');
        cat.className = 'category';
        cat.textContent = p.category;

        const price = document.createElement('div');
        price.className = 'price';
        price.textContent = `$${parseFloat(p.price).toFixed(2)}`;

        const btn = document.createElement('button');
        btn.className = 'btn btn-primary btn-sm';
        btn.textContent = 'Add to Cart';
        btn.addEventListener('click', () => addToCart(p.id, btn));

        body.append(name, cat, price, btn);
        card.append(img, body);
        grid.appendChild(card);
      });
    } catch (err) {
      setLoading('Failed to load products: ' + err.message);
    }
  }

  async function addToCart(productId, btn) {
    if (!requireAuth()) return;
    btn.disabled = true;
    btn.textContent = 'Adding...';
    try {
      await fetchAPI('/cart/add.php', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      btn.textContent = 'Added!';
      loadCartCount();
      setTimeout(() => { btn.textContent = 'Add to Cart'; btn.disabled = false; }, 1500);
    } catch (err) {
      alert(err.message);
      btn.textContent = 'Add to Cart';
      btn.disabled = false;
    }
  }

  searchInput?.addEventListener('input', debounce(loadProducts, 400));
  catSelect?.addEventListener('change', loadProducts);
  loadProducts();
});

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}
