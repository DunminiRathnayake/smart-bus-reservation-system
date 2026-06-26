/**
 * SmartGo Core Interface Script
 */

document.addEventListener('DOMContentLoaded', () => {
  injectHeader();
  injectFooter();
  setupSessionMenu();
});

function injectHeader() {
  const header = document.getElementById('app-header');
  if (!header) return;

  const currentPath = window.location.pathname;
  const isIndex = currentPath.endsWith('/') || currentPath.endsWith('index.html');
  const isBookings = currentPath.endsWith('bookings.html');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  let navLinksHtml = `
    <a href="index.html" class="nav-link ${isIndex ? 'active' : ''}">Search Trips</a>
  `;

  let authSectionHtml = '';

  if (token) {
    navLinksHtml += `
      <a href="bookings.html" class="nav-link ${isBookings ? 'active' : ''}">My Bookings</a>
    `;

    authSectionHtml = `
      <div class="user-badge">
        <span>Hi, <strong>${user.fullName || 'User'}</strong></span>
      </div>
      <button id="btn-logout" class="btn btn-secondary btn-sm">Logout</button>
    `;
  } else {
    authSectionHtml = `
      <a href="login.html" class="nav-link">Login</a>
      <a href="register.html" class="btn btn-primary btn-sm">Register</a>
    `;
  }

  header.innerHTML = `
    <div class="container header-container">
      <a href="index.html" class="logo">
        <span>SmartGo</span>
      </a>
      <nav class="main-nav">
        ${navLinksHtml}
      </nav>
      <div class="nav-auth">
        ${authSectionHtml}
      </div>
    </div>
  `;
}

function injectFooter() {
  const footer = document.getElementById('app-footer');
  if (!footer) return;

  footer.innerHTML = `
    <div class="container footer-container">
      <p>© ${new Date().getFullYear()} SmartGo. All rights reserved.</p>
      <div class="footer-links">
        <a href="#">Terms of Service</a>
        <a href="#">Privacy Policy</a>
      </div>
    </div>
  `;
}

function setupSessionMenu() {
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'index.html';
    });
  }
}
