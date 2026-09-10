// Shared Sidebar Handler (sidebar.js)

document.addEventListener('DOMContentLoaded', () => {
  initSharedSidebarToggle();
});

function initSharedSidebarToggle() {
  const toggleBtn = document.getElementById('mobile-toggle-btn');
  const sidebar = document.getElementById('app-sidebar');
  const mainWrapper = document.querySelector('.main-wrapper');

  if (!toggleBtn || !sidebar) return;

  // Prevent duplicate listener attachments
  if (toggleBtn.dataset.sidebarInitialized === 'true') return;
  toggleBtn.dataset.sidebarInitialized = 'true';

  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  toggleBtn.addEventListener('click', () => {
    if (window.innerWidth <= 992) {
      // Mobile screen: toggle slide overlay
      sidebar.classList.toggle('show');
      overlay.classList.toggle('show');
    } else {
      // Desktop screen: toggle collapse sidebar
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
