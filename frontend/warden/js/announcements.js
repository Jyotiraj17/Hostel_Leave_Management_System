document.addEventListener('DOMContentLoaded', async () => {
  await loadAnnouncements();
  initAnnouncementForm();
});

let allAnnouncements = [];

async function loadAnnouncements() {
  const container = document.getElementById('announcements-container');
  if (!container) return;

  try {
    const res = await api.get('/warden/announcements');
    if (!res.success) {
      container.innerHTML = `<div class="empty-state">Unable to load announcements.</div>`;
      return;
    }

    allAnnouncements = res.announcements || [];
    renderAnnouncementsList(container, allAnnouncements);
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Failed to load announcements. ${err.message}</div>`;
  }
}

function renderAnnouncementsList(container, list) {
  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 3rem 1rem;">
        <div class="empty-icon"><i data-lucide="megaphone"></i></div>
        <h3>No Announcements Created Yet</h3>
        <p style="margin-top:0.35rem; color:var(--text-muted);">Click "Publish New Announcement" above to broadcast a notice to students.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = `
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Title & Description</th>
            <th>Priority</th>
            <th>Posted On</th>
            <th>Expiry Date</th>
            <th>Status</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(a => `
            <tr>
              <td>
                <strong style="font-size: 0.95rem; color: var(--text-main);">${a.title}</strong>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">${a.description}</div>
              </td>
              <td><span class="badge badge-${a.priority.toLowerCase()}">${a.priority}</span></td>
              <td>${formatDate(a.createdAt)}</td>
              <td>${a.expiryDate ? formatDate(a.expiryDate) : 'No Expiry'}</td>
              <td><span class="badge badge-${a.status.toLowerCase()}">${a.status}</span></td>
              <td>
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; white-space: nowrap;">
                  <button class="btn-icon btn-icon-edit edit-ann-btn" data-id="${a._id}" title="Edit Announcement">
                    <i data-lucide="edit"></i>
                  </button>
                  <button class="btn-icon btn-icon-delete delete-ann-btn" data-id="${a._id}" title="Delete Announcement">
                    <i data-lucide="trash-2"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // Attach Edit Listener
  container.querySelectorAll('.edit-ann-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ann = allAnnouncements.find(a => a._id === btn.dataset.id);
      if (!ann) return;

      document.getElementById('ann-id').value = ann._id;
      document.getElementById('ann-title').value = ann.title;
      document.getElementById('ann-description').value = ann.description;
      document.getElementById('ann-priority').value = ann.priority;
      document.getElementById('ann-expiryDate').value = ann.expiryDate ? ann.expiryDate.split('T')[0] : '';
      document.getElementById('ann-modal-title').textContent = 'Edit Announcement';
      document.getElementById('announcement-modal').classList.add('show');
    });
  });

  // Attach Delete Listener
  container.querySelectorAll('.delete-ann-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const annId = btn.dataset.id;
      if (!confirm('Are you sure you want to delete this announcement?')) return;

      try {
        const res = await api.delete(`/warden/announcements/${annId}`);
        if (res.success) {
          toast.success('Announcement deleted successfully.');
          await loadAnnouncements();
        } else {
          toast.error(res.message || 'Failed to delete announcement.');
        }
      } catch (err) {
        toast.error(err.message || 'Error deleting announcement.');
      }
    });
  });
}

function initAnnouncementForm() {
  const form = document.getElementById('announcement-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const annId = document.getElementById('ann-id').value;
    const title = document.getElementById('ann-title').value.trim();
    const description = document.getElementById('ann-description').value.trim();
    const priority = document.getElementById('ann-priority').value;
    const expiryDate = document.getElementById('ann-expiryDate').value;

    if (!validator.isNotEmpty(title) || !validator.isNotEmpty(description)) {
      toast.error('Please provide both title and description.');
      return;
    }

    const saveBtn = document.getElementById('save-ann-btn');
    saveBtn.disabled = true;
    saveBtn.querySelector('span').textContent = 'Saving...';

    try {
      let res;
      if (annId) {
        res = await api.put(`/warden/announcements/${annId}`, { title, description, priority, expiryDate });
      } else {
        res = await api.post('/warden/announcements', { title, description, priority, expiryDate });
      }

      if (res.success) {
        toast.success(annId ? 'Announcement updated successfully.' : 'Announcement published successfully.');
        document.getElementById('announcement-modal').classList.remove('show');
        form.reset();
        await loadAnnouncements();
      } else {
        toast.error(res.message || 'Failed to save announcement.');
      }
    } catch (err) {
      toast.error(err.message || 'Error saving announcement.');
    } finally {
      saveBtn.disabled = false;
      saveBtn.querySelector('span').textContent = 'Publish';
    }
  });
}

function formatDate(dStr) {
  if (!dStr) return '-';
  const d = new Date(dStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
