document.addEventListener('DOMContentLoaded', () => {
  // ===== LOGIN PAGE =====
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    if (isLoggedIn()) { window.location.href = '/'; return; }

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      try {
        const data = await fetchAPI('/auth/login.php', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        setUser(data.user);
        window.location.href = data.user.role === 'admin' ? '/admin/dashboard.html' : '/';
      } catch (err) {
        showAlert('alert-box', err.message);
      }
    });
  }

  // ===== REGISTER PAGE =====
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    if (isLoggedIn()) { window.location.href = '/'; return; }

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name     = document.getElementById('name').value.trim();
      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirm  = document.getElementById('confirm').value;

      if (password !== confirm) {
        showAlert('alert-box', 'Passwords do not match');
        return;
      }
      try {
        await fetchAPI('/auth/register.php', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        });
        showAlert('alert-box', 'Registration successful! Redirecting to login...', 'success');
        setTimeout(() => { window.location.href = '/login.html'; }, 1500);
      } catch (err) {
        showAlert('alert-box', err.message);
      }
    });
  }
});
