document.addEventListener('DOMContentLoaded', async () => {
  await loadAnnouncements();
});

let allAnnouncements = [];

async function loadAnnouncements() {
  const container = document.getElementById('announcements-container');
  if (!container) return;

  try {
    const res = await api.get('/student/announcements');
    if (!res.success) {
      container.innerHTML = `<div class="empty-state">Unable to load announcements.</div>`;
      return;
    }

    allAnnouncements = res.announcements || [];
    renderAnnouncementsList(container, allAnnouncements);

    // Attach Priority Filter Handlers
    const filterBtns = document.querySelectorAll('.announcement-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('btn-primary'));
        filterBtns.forEach(b => b.classList.add('btn-secondary'));
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');

        const priority = btn.dataset.priority;
        if (priority === 'ALL') {
          renderAnnouncementsList(container, allAnnouncements);
        } else {
          const filtered = allAnnouncements.filter(a => a.priority.toUpperCase() === priority.toUpperCase());
          renderAnnouncementsList(container, filtered);
        }
      });
    });

  } catch (err) {
    container.innerHTML = `<div class="empty-state">Failed to load announcements. ${err.message}</div>`;
  }
}

function renderAnnouncementsList(container, list) {
  if (list.length === 0) {
    container.innerHTML = `
      <div class="card empty-state" style="padding: 3rem 1rem;">
        <div class="empty-icon"><i data-lucide="megaphone"></i></div>
        <h3>No Active Announcements</h3>
        <p style="margin-top:0.35rem; color:var(--text-muted);">There are no active hostel announcements at this time.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
      ${list.map(a => `
        <div class="card" style="margin-bottom:0; transition: transform 0.2s ease, box-shadow 0.2s ease;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
              <span class="badge badge-${a.priority.toLowerCase()}">${a.priority} Priority</span>
              <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">${a.title}</h3>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; display: flex; align-items: center; gap: 0.25rem;">
              <i data-lucide="clock" style="width: 14px; height: 14px;"></i>
              <span>Posted ${formatDate(a.createdAt)}</span>
            </div>
          </div>

          <p style="font-size: 0.925rem; color: var(--text-main); line-height: 1.6; margin-bottom: 1rem;">
            ${a.description}
          </p>

          ${a.expiryDate ? `
            <div style="font-size: 0.75rem; color: var(--warning); font-weight: 600; display: flex; align-items: center; gap: 0.35rem; border-top: 1px dashed var(--border-color); padding-top: 0.75rem;">
              <i data-lucide="alert-triangle" style="width: 14px; height: 14px;"></i>
              <span>Valid until ${formatDate(a.expiryDate)}</span>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

function formatDate(dStr) {
  if (!dStr) return '-';
  const d = new Date(dStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
