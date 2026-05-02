const API_BASE = '/api';

// Escape HTML to prevent XSS when inserting user-provided content
function esc(str) {
  const d = document.createElement('div');
  d.textContent = String(str ?? '');
  return d.innerHTML;
}

async function fetchAPI(endpoint, options = {}) {
  const res = await fetch(API_BASE + endpoint, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

function isLoggedIn() { return !!getUser(); }
function isAdmin()    { return getUser()?.role === 'admin'; }

function setUser(user) { localStorage.setItem('user', JSON.stringify(user)); }
function clearUser()   { localStorage.removeItem('user'); }

async function logout() {
  try { await fetchAPI('/auth/logout.php', { method: 'POST' }); } catch {}
  clearUser();
  window.location.href = '/login.html';
}

function showAlert(containerId, message, type = 'error') {
  const el = document.getElementById(containerId);
  if (!el) return;
  const div = document.createElement('div');
  div.className = `alert alert-${type}`;
  div.textContent = message;
  el.replaceChildren(div);
  setTimeout(() => { el.replaceChildren(); }, 4000);
}

function statusBadge(status) {
  const span = document.createElement('span');
  span.className = `badge badge-${esc(status)}`;
  span.textContent = status;
  return span.outerHTML;
}

function renderNav() {
  const nav = document.getElementById('navbar-nav');
  if (!nav) return;
  const user = getUser();
  nav.replaceChildren();
  if (user) {
    const links = [
      { href: '/products.html', text: 'Shop' },
      { href: '/cart.html', text: 'Cart', badge: true },
      { href: '/orders.html', text: 'My Orders' },
    ];
    if (user.role === 'admin') links.push({ href: '/admin/dashboard.html', text: 'Admin' });

    links.forEach(({ href, text, badge }) => {
      const li = document.createElement('li');
      const a  = document.createElement('a');
      a.href = href;
      a.textContent = text;
      if (badge) {
        const b = document.createElement('span');
        b.className = 'cart-badge';
        b.id = 'cart-count';
        b.textContent = '0';
        a.appendChild(b);
      }
      li.appendChild(a);
      nav.appendChild(li);
    });

    const li  = document.createElement('li');
    const btn = document.createElement('a');
    btn.href = '#';
    btn.className = 'btn btn-outline btn-sm';
    btn.textContent = user.name;
    btn.addEventListener('click', (e) => { e.preventDefault(); logout(); });
    li.appendChild(btn);
    nav.appendChild(li);

    loadCartCount();
  } else {
    const items = [
      { href: '/products.html', text: 'Shop', cls: '' },
      { href: '/login.html',    text: 'Login',    cls: 'btn btn-outline btn-sm' },
      { href: '/register.html', text: 'Register', cls: 'btn btn-primary btn-sm' },
    ];
    items.forEach(({ href, text, cls }) => {
      const li = document.createElement('li');
      const a  = document.createElement('a');
      a.href = href;
      a.textContent = text;
      if (cls) a.className = cls;
      li.appendChild(a);
      nav.appendChild(li);
    });
  }
}

async function loadCartCount() {
  if (!isLoggedIn()) return;
  try {
    const data = await fetchAPI('/cart/get.php');
    const el = document.getElementById('cart-count');
    if (el) el.textContent = data.items.length;
  } catch {}
}

function requireAuth() {
  if (!isLoggedIn()) { window.location.href = '/login.html'; return false; }
  return true;
}

function requireAdminAccess() {
  if (!isAdmin()) { window.location.href = '/'; return false; }
  return true;
}

document.addEventListener('DOMContentLoaded', renderNav);
