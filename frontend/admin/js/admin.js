// Shared Layout & Authentication Handler for Admin Module

document.addEventListener('DOMContentLoaded', () => {
  // 1. Verify Admin Authentication
  if (!auth.isLoggedIn()) {
    window.location.href = '/auth/login.html';
    return;
  }

  const user = auth.getUser();
  if (!user || user.role !== 'admin') {
    if (user && user.role === 'student') {
      window.location.href = '/student/dashboard.html';
    } else if (user && user.role === 'warden') {
      window.location.href = '/warden/dashboard.html';
    } else {
      window.location.href = '/auth/login.html';
    }
    return;
  }

  // 2. Initialize Layout Components
  renderSidebar();
  renderTopbar();
  setupMobileToggle();
  loadAdminProfileHeader();
});

// Render Sidebar Navigation
function renderSidebar() {
  const currentPath = window.location.pathname;

  const menuItems = [
    { title: 'Dashboard', icon: 'home', href: '/admin/dashboard.html' },
    { title: 'Students', icon: 'users', href: '/admin/students.html' },
    { title: 'Wardens', icon: 'user-check', href: '/admin/wardens.html' },
    { title: 'Rooms', icon: 'bed', href: '/admin/rooms.html' },
    { title: 'Leave Records', icon: 'calendar', href: '/admin/leaves.html' },
    { title: 'Complaints', icon: 'alert-circle', href: '/admin/complaints.html' },
    { title: 'Announcements', icon: 'megaphone', href: '/admin/announcements.html' },
    { title: 'Reports', icon: 'bar-chart-3', href: '/admin/reports.html' },
    { title: 'Profile', icon: 'user', href: '/admin/profile.html' },
    { title: 'Change Password', icon: 'key', href: '/admin/change-password.html' }
  ];

  const sidebarEl = document.getElementById('app-sidebar');
  if (!sidebarEl) return;

  sidebarEl.innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-brand-title">HMS</div>
      <div class="sidebar-brand-subtitle">Hostel Management System</div>
    </div>

    <div class="sidebar-section-label">ADMIN PANEL</div>

    <ul class="sidebar-menu">
      ${menuItems.map(item => {
        const isActive = currentPath.endsWith(item.href) || (currentPath === '/admin/' && item.href.includes('dashboard'));
        return `
          <li class="sidebar-item">
            <a href="${item.href}" class="sidebar-link ${isActive ? 'active' : ''}">
              <i data-lucide="${item.icon}"></i>
              <span>${item.title}</span>
            </a>
          </li>
        `;
      }).join('')}
    </ul>

    <div class="sidebar-footer">
      <button class="logout-btn" id="logout-button">
        <i data-lucide="log-out"></i>
        <span>Logout</span>
      </button>
    </div>
  `;

  // Attach Logout event listener
  document.getElementById('logout-button').addEventListener('click', () => {
    auth.logout();
  });
}

// Render Topbar
function renderTopbar() {
  const topbarEl = document.getElementById('app-topbar');
  if (!topbarEl) return;

  const pageTitle = document.body.dataset.pageTitle || 'Admin Portal';

  topbarEl.innerHTML = `
    <div class="topbar-left">
      <button class="mobile-toggle" id="mobile-toggle-btn" aria-label="Toggle menu">
        <i data-lucide="menu"></i>
      </button>
      <div class="topbar-title">${pageTitle}</div>
    </div>

    <div class="topbar-right">
      <div class="user-profile-badge">
        <img id="header-avatar" src="../assets/images/avatar-placeholder.png" onerror="this.src='../assets/images/avatar-placeholder.png'" alt="Avatar" class="user-avatar" />
        <div class="user-info">
          <span class="user-name" id="header-user-name">Admin User</span>
          <span class="user-role">Administrator</span>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) {
    lucide.createIcons();
  }
}

// Sidebar Toggle Handler (3-line menu button)
function setupMobileToggle() {
  if (typeof initSharedSidebarToggle === 'function') {
    initSharedSidebarToggle();
    return;
  }
  const toggleBtn = document.getElementById('mobile-toggle-btn');
  const sidebar = document.getElementById('app-sidebar');
  const mainWrapper = document.querySelector('.main-wrapper');
  
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      if (window.innerWidth <= 992) {
        // Mobile screen behavior
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
      } else {
        // Desktop screen behavior
        sidebar.classList.toggle('collapsed');
        if (mainWrapper) {
          mainWrapper.classList.toggle('sidebar-collapsed');
        }
      }
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('show');
      overlay.classList.remove('show');
    });
  }
}

// Load Admin Profile Header info
async function loadAdminProfileHeader() {
  const user = auth.getUser();
  if (user && user.email) {
    const nameEl = document.getElementById('header-user-name');
    if (nameEl) nameEl.textContent = user.email.split('@')[0].toUpperCase();
  }
}
