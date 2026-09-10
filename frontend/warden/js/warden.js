// Shared Layout & Authentication Handler for Warden Module

document.addEventListener('DOMContentLoaded', () => {
  // 1. Verify Warden Authentication
  if (!auth.isLoggedIn()) {
    window.location.href = '/auth/login.html';
    return;
  }

  const user = auth.getUser();
  if (!user || (user.role !== 'warden' && user.role !== 'admin')) {
    if (user && user.role === 'student') {
      window.location.href = '/student/dashboard.html';
    } else {
      window.location.href = '/auth/login.html';
    }
    return;
  }

  // 2. Initialize Layout Components
  renderSidebar();
  renderTopbar();
  setupMobileToggle();
  loadWardenProfileHeader();
});

// Render Sidebar Navigation
function renderSidebar() {
  const currentPath = window.location.pathname;

  const menuItems = [
    { title: 'Dashboard', icon: 'home', href: '/warden/dashboard.html' },
    { title: 'Students', icon: 'users', href: '/warden/students.html' },
    { title: 'Rooms', icon: 'bed', href: '/warden/rooms.html' },
    { title: 'Leave Requests', icon: 'calendar', href: '/warden/leaves.html' },
    { title: 'Complaints', icon: 'alert-circle', href: '/warden/complaints.html' },
    { title: 'Announcements', icon: 'megaphone', href: '/warden/announcements.html' },
    { title: 'Profile', icon: 'user', href: '/warden/profile.html' },
    { title: 'Change Password', icon: 'key', href: '/warden/change-password.html' }
  ];

  const sidebarEl = document.getElementById('app-sidebar');
  if (!sidebarEl) return;

  sidebarEl.innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-brand-title">HMS</div>
      <div class="sidebar-brand-subtitle">Hostel Management System</div>
    </div>

    <div class="sidebar-section-label">WARDEN PANEL</div>

    <ul class="sidebar-menu">
      ${menuItems.map(item => {
        const isActive = currentPath.endsWith(item.href) || (currentPath === '/warden/' && item.href.includes('dashboard'));
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

  const pageTitle = document.body.dataset.pageTitle || 'Warden Portal';

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
          <span class="user-name" id="header-user-name">Loading...</span>
          <span class="user-role">Hostel Warden</span>
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

// Load Warden Profile for Header
async function loadWardenProfileHeader() {
  try {
    const data = await api.get('/warden/profile');
    if (data.success && data.warden) {
      const nameEl = document.getElementById('header-user-name');
      if (nameEl) nameEl.textContent = data.warden.fullName;
    }
  } catch (err) {
    console.error('Failed to load warden profile header:', err);
  }
}
